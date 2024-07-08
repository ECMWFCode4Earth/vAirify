from datetime import datetime, timezone
from ..context import shared  # noqa: F401

import pytest
from cerberus import Validator

from shared.src.database.locations import AirQualityLocationType
from src.forecast.forecast_adapter import (
    ForecastData,
    transform,
)
from shared.tests.util.mock_forecast_data import (
    single_level_data_set,
    multi_level_data_set,
    default_test_cities,
    default_time,
)


@pytest.mark.parametrize(
    "field, expected",
    [
        ("name", ["Dublin", "Dublin", "London", "London"]),
        (
            "location",
            [
                {"coordinates": [0, -10], "type": "Point"},
                {"coordinates": [0, -10], "type": "Point"},
                {"coordinates": [10, 0], "type": "Point"},
                {"coordinates": [10, 0], "type": "Point"},
            ],
        ),
        (
            "forecast_valid_time",
            [
                datetime(2024, 4, 22, 0, 0, tzinfo=timezone.utc),
                datetime(2024, 4, 23, 0, 0, tzinfo=timezone.utc),
                datetime(2024, 4, 22, 0, 0, tzinfo=timezone.utc),
                datetime(2024, 4, 23, 0, 0, tzinfo=timezone.utc),
            ],
        ),
        ("forecast_base_time", datetime.fromtimestamp(default_time, timezone.utc)),
        ("forecast_range", [0, 24, 0, 24]),
        ("source", "cams-production"),
    ],
)
def test__transform__returns_correct_values(field, expected):
    input_data = ForecastData(single_level_data_set, multi_level_data_set)
    dublin_and_london = default_test_cities[0:2]
    results = transform(input_data, dublin_and_london)
    if isinstance(expected, list):
        assert list(map(lambda x: x[field], results)) == expected
    else:
        for data in results:
            assert data[field] == expected


def test__transform__returns_correctly_formatted_data():
    input_data = ForecastData(single_level_data_set, multi_level_data_set)
    expected_aqi_schema = {"type": "integer", "min": 1, "max": 6}
    expected_pollutant_schema = {
        "aqi_level": expected_aqi_schema,
        "value": {"type": "float"},
    }
    expected_document_schema = {
        "name": {"type": "string"},
        "location_type": {"allowed": [AirQualityLocationType.CITY]},
        "location": {
            "type": "dict",
            "schema": {
                "coordinates": {
                    "type": "list",
                    "minlength": 2,
                    "maxlength": 2,
                },
                "type": {
                    "type": "string",
                    "allowed": ["Point"],
                },
            },
        },
        "forecast_valid_time": {"type": "datetime"},
        "forecast_base_time": {"type": "datetime"},
        "forecast_range": {"type": "integer"},
        "no2": {"type": "dict", "schema": expected_pollutant_schema},
        "o3": {"type": "dict", "schema": expected_pollutant_schema},
        "pm10": {"type": "dict", "schema": expected_pollutant_schema},
        "pm2_5": {"type": "dict", "schema": expected_pollutant_schema},
        "so2": {"type": "dict", "schema": expected_pollutant_schema},
        "overall_aqi_level": expected_aqi_schema,
        "source": {"type": "string", "allowed": ["cams-production"]},
    }
    validator = Validator(expected_document_schema, require_all=True)
    result = transform(input_data, default_test_cities[0:1])
    for data in result:
        assert validator(data) is True, f"{validator.errors}"
