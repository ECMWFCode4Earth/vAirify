import datetime

import pytest
import xarray

from air_quality.aqi.pollutant_type import PollutantType
from air_quality.database.locations import AirQualityLocation, AirQualityLocationType
from air_quality.etl.forecast.forecast_data import (
    convert_east_only_longitude_to_east_west,
    is_single_level,
    convert_to_forecast_data_type,
    ForecastData,
    ForecastDataType,
)
from air_quality.database.in_situ import InSituMeasurement
from tests.util.mock_forecast_data import (
    create_test_pollutant_data,
    single_level_data_set,
    multi_level_data_set,
    default_time,
)
from tests.util.mock_measurement import create_mock_measurement_document


@pytest.mark.parametrize(
    "longitude, expected",
    [
        (0.0, 0.0),
        (179.6, 179.6),
        (180.0, 180.0),
        (180.4, -179.6),
        (360.0, 0),
        (359.6, -0.4),
        (-0.1, -0.1),
        (-180.0, -180.0),
    ],
)
def test__convert_east_only_longitude_to_east_west__converts_correctly(
    longitude: float, expected: float
):
    assert convert_east_only_longitude_to_east_west(longitude) == expected


@pytest.mark.parametrize(
    "forecast_data_type, expected",
    [
        (ForecastDataType.PARTICULATE_MATTER_10, True),
        (ForecastDataType.PARTICULATE_MATTER_2_5, True),
        (ForecastDataType.SURFACE_PRESSURE, True),
        (ForecastDataType.NITROGEN_DIOXIDE, False),
        (ForecastDataType.OZONE, False),
        (ForecastDataType.SULPHUR_DIOXIDE, False),
        (ForecastDataType.TEMPERATURE, False),
    ],
)
def test__is_single_level__returns_correctly(
    forecast_data_type: ForecastDataType, expected: bool
):
    assert is_single_level(forecast_data_type) == expected


@pytest.mark.parametrize(
    "pollutant_data_type, forecast_data_type",
    [
        (PollutantType.PARTICULATE_MATTER_10, ForecastDataType.PARTICULATE_MATTER_10),
        (PollutantType.PARTICULATE_MATTER_2_5, ForecastDataType.PARTICULATE_MATTER_2_5),
        (PollutantType.SULPHUR_DIOXIDE, ForecastDataType.SULPHUR_DIOXIDE),
        (PollutantType.NITROGEN_DIOXIDE, ForecastDataType.NITROGEN_DIOXIDE),
        (PollutantType.OZONE, ForecastDataType.OZONE),
    ],
)
def test__convert_to_forecast_data_type__valid_input_converts_correctly(
    pollutant_data_type: PollutantType, forecast_data_type: ForecastDataType
):
    assert convert_to_forecast_data_type(pollutant_data_type) == forecast_data_type


def test__convert_to_forecast_data_type__invalid_input_raises_error():
    with pytest.raises(ValueError):
        convert_to_forecast_data_type(PollutantType(999))


@pytest.mark.parametrize(
    "coordinates, expected",
    [
        ([(-10.0, -90.0)], [1]),
        ([(0, 0.0)], [4]),
        ([(10.0, 90.0)], [10]),
        ([(-5.0, -45.0)], [2.25]),
        ([(5.0, 90.0), (8.75, 60.0)], [9]),  # Multiple locations
    ],
)
def test__get_pollutant_data_for_locations__interpolates_correctly(
    coordinates, expected
):
    #      -90  0  90
    # -10    1  2   4
    #   0    2  4   8
    #  10    4  8  10
    input_data = create_test_pollutant_data(
        steps=[24],
        latitudes=[-10, 0, 10],
        longitudes=[0, 90, 270],
        values=[2, 4, 1, 4, 8, 2, 8, 10, 4],
    )
    surface_pressure = create_test_pollutant_data(
        steps=[24],
        latitudes=[-10, 0, 10],
        longitudes=[0, 90, 270],
        values=[1, 1, 1, 1, 1, 1, 1, 1, 1],
    )
    temperature = create_test_pollutant_data(
        steps=[24],
        latitudes=[-10, 0, 10],
        longitudes=[0, 90, 270],
        values=[1, 1, 1, 1, 1, 1, 1, 1, 1],
    )
    single_level = xarray.Dataset(
        coords=dict(step=[24]),
        data_vars=dict(pm2p5=input_data, pm10=input_data, sp=surface_pressure),
    )
    multi_level = xarray.Dataset(
        coords=dict(step=[24]),
        data_vars=dict(no2=input_data, so2=input_data, go3=input_data, t=temperature),
    )
    forecast_data = ForecastData(single_level, multi_level)
    locations: list[AirQualityLocation] = [
        {
            "name": "test",
            "type": AirQualityLocationType.CITY,
            "latitude": lat_long[0],
            "longitude": lat_long[1],
        }
        for lat_long in coordinates
    ]

    result = forecast_data.get_pollutant_data_for_locations(
        locations,
        list(PollutantType),
    )

    expected_results = [
        (location, {pollutant_type: expected for pollutant_type in PollutantType})
        for location in locations
    ]
    assert result == expected_results


def test__enrich_in_situ_measurements__interpolates_correctly():
    single_level = single_level_data_set
    multi_level = multi_level_data_set
    forecast_data = ForecastData(single_level, multi_level)

    initial_date = datetime.datetime.fromtimestamp(default_time) + datetime.timedelta(
        hours=12
    )
    required = [ForecastDataType.TEMPERATURE, ForecastDataType.SURFACE_PRESSURE]
    in_situ_measurements: list[InSituMeasurement] = [
        create_mock_measurement_document(
            {
                "location": {"type": "point", "coordinates": (5, -5)},
                "measurement_date": initial_date,
            }
        )
    ]

    # This should find the values interpolated bang in the middle of:
    # T=0    (0,0) pressure = 0.4, temperature = 40
    # T=0    (10,0) pressure = 0.5, temperature = 50
    # T=0    (0,-10) pressure = 0.1, temperature = 10
    # T=0    (10,-10) pressure = 0.2, temperature = 20
    # T=24   (0,0) pressure = 1.3, temperature = 130
    # T=24   (10,0) pressure = 1.4, temperature = 140
    # T=24   (0,-10) pressure = 1, temperature = 100
    # T=24   (10,-10) pressure = 1.1, temperature = 100
    result = forecast_data.enrich_in_situ_measurements(in_situ_measurements, required)

    assert len(result) == 1
    assert result[0][0] == in_situ_measurements[0]
    assert result[0][1][ForecastDataType.SURFACE_PRESSURE] == 0.75
    assert result[0][1][ForecastDataType.TEMPERATURE] == 75


def test__enrich_in_situ_measurements__duplicate_longitude_functions_correctly():
    single_level = single_level_data_set
    multi_level = multi_level_data_set
    forecast_data = ForecastData(single_level, multi_level)

    initial_date = (datetime.datetime.fromtimestamp(default_time)) + datetime.timedelta(
        hours=24
    )
    required = [ForecastDataType.TEMPERATURE, ForecastDataType.SURFACE_PRESSURE]
    # co-ords are (long, lat)
    in_situ_measurements: list[InSituMeasurement] = [
        create_mock_measurement_document(
            {
                "location": {"type": "point", "coordinates": (0, -10)},
                "measurement_date": initial_date,
            }
        ),
        create_mock_measurement_document(
            {
                "location": {"type": "point", "coordinates": (0, 0)},
                "measurement_date": initial_date,
            }
        ),
    ]

    result = forecast_data.enrich_in_situ_measurements(in_situ_measurements, required)

    assert len(result) == 2

    assert result[0][0] == in_situ_measurements[0]
    assert result[1][0] == in_situ_measurements[1]

    assert result[0][0] == in_situ_measurements[0]
    assert result[0][1][ForecastDataType.TEMPERATURE] == 100
    assert result[0][1][ForecastDataType.SURFACE_PRESSURE] == pytest.approx(1)

    assert result[1][0] == in_situ_measurements[1]
    assert result[1][1][ForecastDataType.TEMPERATURE] == 130
    assert result[1][1][ForecastDataType.SURFACE_PRESSURE] == pytest.approx(1.3)


def test__enrich_in_situ_measurements__duplicate_latitude_functions_correctly():
    single_level = single_level_data_set
    multi_level = multi_level_data_set
    forecast_data = ForecastData(single_level, multi_level)

    initial_date = datetime.datetime.fromtimestamp(default_time)
    required = [ForecastDataType.TEMPERATURE, ForecastDataType.SURFACE_PRESSURE]

    # co-ords are (long, lat)
    in_situ_measurements: list[InSituMeasurement] = [
        create_mock_measurement_document(
            {
                "location": {"type": "point", "coordinates": (0, -10)},
                "measurement_date": initial_date,
            }
        ),
        create_mock_measurement_document(
            {
                "location": {"type": "point", "coordinates": (10, -10)},
                "measurement_date": initial_date,
            }
        ),
    ]

    result = forecast_data.enrich_in_situ_measurements(in_situ_measurements, required)

    assert len(result) == 2

    assert result[0][0] == in_situ_measurements[0]
    assert result[0][1][ForecastDataType.TEMPERATURE] == 10
    assert result[0][1][ForecastDataType.SURFACE_PRESSURE] == pytest.approx(0.1)

    assert result[1][0] == in_situ_measurements[1]
    assert result[1][1][ForecastDataType.TEMPERATURE] == 20
    assert result[1][1][ForecastDataType.SURFACE_PRESSURE] == pytest.approx(0.2)
