from datetime import datetime, timezone
from unittest.mock import Mock, patch

import pytest

from shared.src.aqi.pollutant_type import PollutantType
from src.forecast.forecast_data import ForecastDataType
from src.in_situ.openaq_adapter import (
    transform_city,
    enrich_with_forecast_data,
)
from shared.tests.util.mock_measurement import (
    create_mock_measurement_document,
    create_mock_open_aq_response,
)

city = {"name": "Dublin", "latitude": 53.350140, "longitude": -6.266155, "type": "city"}


def test__transform_city__multiple_sites_in_city():
    result = transform_city(
        {
            "city": city,
            "measurements": [
                create_mock_open_aq_response(
                    {
                        "location": "Dublin 1",
                        "parameter": "so2",
                        "value": 14.0,
                        "date": {
                            "utc": "2024-04-21T00:00:00+00:00",
                            "local": "2024-04-21T01:00:00+01:00",
                        },
                    }
                ),
                create_mock_open_aq_response(
                    {
                        "location": "Dublin 2",
                        "parameter": "so2",
                        "value": 11.0,
                        "coordinates": {
                            "latitude": 1.0,
                            "longitude": 1.0,
                        },
                        "date": {
                            "utc": "2024-04-21T00:00:00+00:00",
                            "local": "2024-04-21T01:00:00+01:00",
                        },
                    }
                ),
                create_mock_open_aq_response(
                    {
                        "location": "Dublin 2",
                        "parameter": "so2",
                        "value": 12.0,
                        "coordinates": {
                            "latitude": 1.0,
                            "longitude": 1.0,
                        },
                        "date": {
                            "utc": "2024-04-21T03:00:00+00:00",
                            "local": "2024-04-21T04:00:00+01:00",
                        },
                    }
                ),
            ],
        }
    )
    assert result == [
        {
            "api_source": "OpenAQ",
            "name": "Dublin",
            "location_type": "city",
            "location_name": "Dublin 1",
            "location": {
                "coordinates": (0.0, 0.0),
                "type": "point",
            },
            "measurement_date": datetime(2024, 4, 21, 0, 0, tzinfo=timezone.utc),
            "metadata": {
                "entity": "Governmental Organization",
                "sensor_type": "reference grade",
            },
            "so2": {
                "value": 14.0,
                "unit": "µg/m³",
                "original_value": 14.0,
                "original_unit": "µg/m³",
            },
        },
        {
            "api_source": "OpenAQ",
            "name": "Dublin",
            "location_type": "city",
            "location_name": "Dublin 2",
            "location": {
                "coordinates": (1.0, 1.0),
                "type": "point",
            },
            "measurement_date": datetime(2024, 4, 21, 0, 0, tzinfo=timezone.utc),
            "metadata": {
                "entity": "Governmental Organization",
                "sensor_type": "reference grade",
            },
            "so2": {
                "value": 11.0,
                "unit": "µg/m³",
                "original_value": 11.0,
                "original_unit": "µg/m³",
            },
        },
        {
            "api_source": "OpenAQ",
            "name": "Dublin",
            "location_type": "city",
            "location_name": "Dublin 2",
            "location": {
                "coordinates": (1.0, 1.0),
                "type": "point",
            },
            "measurement_date": datetime(2024, 4, 21, 3, 0, tzinfo=timezone.utc),
            "metadata": {
                "entity": "Governmental Organization",
                "sensor_type": "reference grade",
            },
            "so2": {
                "value": 12.0,
                "unit": "µg/m³",
                "original_value": 12.0,
                "original_unit": "µg/m³",
            },
        },
    ]


def test__transform_city__invalid_unit_filtered_out():

    measurement = create_mock_open_aq_response(
        {"parameter": "so2", "value": 14.0, "unit": "invalid"}
    )

    result = transform_city({"city": city, "measurements": [measurement]})
    assert result == []


def test__transform_city__negative_value_filtered_out():
    measurement = create_mock_open_aq_response(
        {
            "parameter": "so2",
            "value": -14.0,
        }
    )

    result = transform_city({"city": city, "measurements": [measurement]})
    assert result == []


def test__transform_city__large_error_value_filtered_out():
    measurement = create_mock_open_aq_response(
        {
            "parameter": "so2",
            "value": 9999.0,
        }
    )

    result = transform_city({"city": city, "measurements": [measurement]})
    assert result == []


@pytest.mark.parametrize("pollutant", ["pm10", "pm25"])
def test__transform_city__ppm_value_for_pm_pollutant_filtered_out(pollutant):

    measurement = create_mock_open_aq_response(
        {"parameter": pollutant, "value": 14.0, "unit": "ppm"}
    )

    result = transform_city({"city": city, "measurements": [measurement]})
    assert result == []


@pytest.mark.parametrize("pollutant", ["no2", "so2", "o3"])
def test__transform_city__ppm_value_for_non_pm_pollutant_not_filtered_out(pollutant):

    measurement = create_mock_open_aq_response(
        {"parameter": pollutant, "value": 14.0, "unit": "ppm"}
    )

    result = transform_city({"city": city, "measurements": [measurement]})
    assert len(result) == 1


def test__transform_city__all_five_pollutants():

    test_co_ords = {"latitude": 53.34187500024688, "longitude": -6.2140750004382745}
    result = transform_city(
        {
            "city": city,
            "measurements": [
                create_mock_open_aq_response(
                    {"parameter": "no2", "value": 1.0, "coordinates": test_co_ords}
                ),
                create_mock_open_aq_response(
                    {"parameter": "o3", "value": 2.0, "coordinates": test_co_ords}
                ),
                create_mock_open_aq_response(
                    {"parameter": "so2", "value": 3.0, "coordinates": test_co_ords}
                ),
                create_mock_open_aq_response(
                    {"parameter": "pm10", "value": 4.0, "coordinates": test_co_ords}
                ),
                create_mock_open_aq_response(
                    {"parameter": "pm25", "value": 5.0, "coordinates": test_co_ords}
                ),
            ],
        }
    )
    assert result == [
        {
            "api_source": "OpenAQ",
            "name": "Dublin",
            "location_type": "city",
            "location_name": "Dublin measurement station",
            "location": {
                "coordinates": (-6.2140750004382745, 53.34187500024688),
                "type": "point",
            },
            "measurement_date": datetime(2024, 4, 21, 0, 0, tzinfo=timezone.utc),
            "metadata": {
                "entity": "Governmental Organization",
                "sensor_type": "reference grade",
            },
            "no2": {
                "value": 1.0,
                "unit": "µg/m³",
                "original_value": 1.0,
                "original_unit": "µg/m³",
            },
            "o3": {
                "value": 2.0,
                "unit": "µg/m³",
                "original_value": 2.0,
                "original_unit": "µg/m³",
            },
            "pm10": {
                "value": 4.0,
                "unit": "µg/m³",
                "original_value": 4.0,
                "original_unit": "µg/m³",
            },
            "pm2_5": {
                "value": 5.0,
                "unit": "µg/m³",
                "original_value": 5.0,
                "original_unit": "µg/m³",
            },
            "so2": {
                "value": 3.0,
                "unit": "µg/m³",
                "original_value": 3.0,
                "original_unit": "µg/m³",
            },
        }
    ]


@patch("src.in_situ.openaq_adapter.pollutants_with_molecular_weight")
def test__enrich_with_forecast_data__forecast_data_called_correctly_and_enriched(
    pollutants_patch,
):
    in_situ_measurement = create_mock_measurement_document({})

    mock_forecast_data = Mock()
    mock_forecast_data.enrich_in_situ_measurements.return_value = [
        (
            in_situ_measurement,
            {ForecastDataType.SURFACE_PRESSURE: 35, ForecastDataType.TEMPERATURE: 135},
        )
    ]

    pollutants_patch.return_value = []

    result = enrich_with_forecast_data([in_situ_measurement], mock_forecast_data)

    assert result[0]["metadata"]["estimated_surface_pressure_pa"] == 35
    assert result[0]["metadata"]["estimated_temperature_k"] == 135


@patch("src.in_situ.openaq_adapter.pollutants_with_molecular_weight")
def test__enrich_with_forecast_data__non_present_pollutant_ignored(pollutants_patch):
    in_situ_measurement = create_mock_measurement_document({})

    mock_forecast_data = Mock()
    mock_forecast_data.enrich_in_situ_measurements.return_value = [
        (
            in_situ_measurement,
            {ForecastDataType.SURFACE_PRESSURE: 101, ForecastDataType.TEMPERATURE: 102},
        )
    ]
    pollutants_patch.return_value = [PollutantType.OZONE]

    result = enrich_with_forecast_data([in_situ_measurement], mock_forecast_data)
    assert PollutantType.OZONE.value not in result[0]


@patch("src.in_situ.openaq_adapter.pollutants_with_molecular_weight")
def test__enrich_with_forecast_data__pollutant_without_ppm_ignored(pollutants_patch):
    in_situ_measurement = create_mock_measurement_document(
        {
            "o3": {
                "value": 4,
                "unit": "test1",
                "original_value": 7,
                "original_unit": "test2",
            }
        }
    )

    mock_forecast_data = Mock()
    mock_forecast_data.enrich_in_situ_measurements.return_value = [
        (
            in_situ_measurement,
            {ForecastDataType.SURFACE_PRESSURE: 101, ForecastDataType.TEMPERATURE: 102},
        )
    ]
    pollutants_patch.return_value = [PollutantType.OZONE]

    result = enrich_with_forecast_data([in_situ_measurement], mock_forecast_data)
    assert result[0]["o3"]["value"] == 4
    assert result[0]["o3"]["unit"] == "test1"
    assert result[0]["o3"]["original_value"] == 7
    assert result[0]["o3"]["original_unit"] == "test2"


@patch("src.in_situ.openaq_adapter.pollutants_with_molecular_weight")
@patch("src.in_situ.openaq_adapter.convert_ppm_to_mgm3")
def test__enrich_with_forecast_data__pollutant_with_ppm_converted(
    converter_patch, pollutants_patch
):
    in_situ_measurement = create_mock_measurement_document(
        {
            "o3": {
                "value": 4,
                "unit": "test1",
                "original_value": 5,
                "original_unit": "ppm",
            }
        }
    )

    mock_forecast_data = Mock()
    mock_forecast_data.enrich_in_situ_measurements.return_value = [
        (
            in_situ_measurement,
            {ForecastDataType.SURFACE_PRESSURE: 101, ForecastDataType.TEMPERATURE: 102},
        )
    ]
    pollutants_patch.return_value = [PollutantType.OZONE]
    converter_patch.return_value = 201

    result = enrich_with_forecast_data([in_situ_measurement], mock_forecast_data)
    assert result[0]["o3"]["value"] == 201
    assert result[0]["o3"]["unit"] == "µg/m³"
    assert result[0]["o3"]["original_value"] == 5
    assert result[0]["o3"]["original_unit"] == "ppm"

    converter_patch.assert_called_with(5, PollutantType.OZONE, 101, 102)
