from cerberus import Validator
from datetime import datetime
import pytest
from src.etl.forecast.forecast_adapter import (
    ForecastData,
    transform,
)
from .mock_forecast_data import (
    single_level_data_set,
    multi_level_data_set,
    default_test_cities,
)


@pytest.mark.parametrize(
    "field, expected",
    [
        ("name", ["Dublin", "Dublin"]),
        ("location", {"coordinates": [0, -10], "type": "Point"}),
        (
            "measurement_date",
            [datetime(2024, 4, 23, 0, 0), datetime(2024, 4, 24, 0, 0)],
        ),
    ],
)
def test__transform__returns_correct_values(field, expected):
    input_data = ForecastData(single_level_data_set, multi_level_data_set)
    results = transform(input_data, default_test_cities[0])
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
        "name": {"type": "string", "allowed": ["Dublin"]},
        "location_type": {"type": "string", "allowed": ["city"]},
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
        "measurement_date": {"type": "datetime"},
        "no2": {"type": "dict", "schema": expected_pollutant_schema},
        "o3": {"type": "dict", "schema": expected_pollutant_schema},
        "pm10": {"type": "dict", "schema": expected_pollutant_schema},
        "pm2_5": {"type": "dict", "schema": expected_pollutant_schema},
        "so2": {"type": "dict", "schema": expected_pollutant_schema},
        "overall_aqi_level": expected_aqi_schema,
    }
    validator = Validator(expected_document_schema, require_all=True)
    result = transform(input_data, default_test_cities[0])
    for data in result:
        assert validator(data) is True, f"{validator.errors}"
