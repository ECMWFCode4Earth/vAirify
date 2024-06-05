import pytest
import xarray

from air_quality.aqi.pollutant_type import PollutantType
from air_quality.etl.forecast.forecast_data import (
    convert_east_only_longitude_to_east_west,
    ForecastData,
)
from tests.util.mock_forecast_data import (
    create_test_pollutant_data,
)


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
def test__convert_longitude_east_range(longitude: float, expected: float):
    assert convert_east_only_longitude_to_east_west(longitude) == expected


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
    locations = [
        {
            "name": "test",
            "type": "test",
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
