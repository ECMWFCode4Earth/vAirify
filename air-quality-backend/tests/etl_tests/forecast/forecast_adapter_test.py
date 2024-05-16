from cerberus import Validator
from datetime import datetime
import pytest
from src.etl.forecast.forecast_adapter import (
    ForecastData,
    convert_east_only_longitude_to_east_west,
    find_value_for_city,
    transform,
)
from .mock_forecast_data import (
    single_level_data_set,
    multi_level_data_set,
    default_test_cities,
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
    "latitude, longitude, expected",
    [
        (-10.0, -90.0, [1]),
        (0, 0.0, [4]),
        (10.0, 90.0, [10]),
        (-5.0, -45.0, [2.25]),
        (5.0, 90.0, [9]),
        (8.75, 60.0, [9]),
    ],
)
def test__find_value_for_city(latitude: float, longitude: float, expected):
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
    result = find_value_for_city(input_data, latitude, longitude)
    assert (result == expected).all()


@pytest.mark.parametrize(
    "field, expected",
    [
        ("city", ["Dublin", "Dublin"]),
        ("city_location", {"coordinates": [0, -10], "type": "Point"}),
        (
            "measurement_date",
            [datetime(2024, 4, 23, 0, 0), datetime(2024, 4, 24, 0, 0)],
        ),
    ],
)
def test__transform__returns_correct_values(field, expected):
    input_data = ForecastData(single_level_data_set, multi_level_data_set)
    results = transform(input_data, default_test_cities[0:1])
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
        "city": {"type": "string", "allowed": ["Dublin", "London", "Paris"]},
        "city_location": {
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
    result = transform(input_data, default_test_cities)
    for data in result:
        assert validator(data) is True, f"{validator.errors}"
