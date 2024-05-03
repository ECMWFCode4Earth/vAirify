from datetime import datetime
import pytest
from src.etl.forecast.forecast_adapter import (
    ForecastData,
    convert_longitude_east_range,
    find_value_for_city,
    transform,
)
from .mock_forecast_data import (
    no2,
    single_level_data_set,
    multi_level_data_set,
    default_test_cities,
)


@pytest.mark.parametrize(
    "longitude, expected",
    [
        (0.0, 0.0),
        (180.0, 180.0),
        (181.0, 181.0),
        (360.0, 360.0),
        (-0.1, 359.9),
        (-1.1, 358.9),
        (-180.0, 180.0),
        (-179.9, 180.1),
    ],
)
def test_convert_longitude_east_range(longitude: float, expected: float):
    assert convert_longitude_east_range(longitude) == expected


@pytest.mark.parametrize(
    "latitude, longitude, expected",
    [
        (-10.0, 0.0, [0.0000001, 0.0000002]),
        (0, 10.0, [0.000000125, 0.000000225]),
        (10.0, -10.0, [0.00000015, 0.00000025]),
        (-10.0, 4.0, [0.0000001, 0.0000002]),
        (0.0, 5.0, [0.000000125, 0.000000225]),
        (-5.0, 5.0, [0.000000125, 0.000000225]),
    ],
)
def test_find_value_for_city(latitude: float, longitude: float, expected):
    result = find_value_for_city(no2, latitude, longitude)
    assert (result == expected).all()


def test_transform_returns_formatted_data():
    input_data = ForecastData(single_level_data_set, multi_level_data_set)
    expected = [
        {
            "city": "Dublin",
            "city_location": {"coordinates": [0, -10], "type": "Point"},
            "measurement_date": datetime(2024, 4, 23, 0, 0),
            "overall_aqi_level": 6,
            "no2": {"aqi_level": 3, "value": 100},
            "o3": {"aqi_level": 5, "value": 300},
            "pm10": {"aqi_level": 6, "value": 900},
            "pm2_5": {"aqi_level": 6, "value": 700},
            "so2": {"aqi_level": 4, "value": 500},
        },
        {
            "city": "Dublin",
            "city_location": {"coordinates": [0, -10], "type": "Point"},
            "measurement_date": datetime(2024, 4, 24, 0, 0),
            "overall_aqi_level": 6,
            "no2": {"aqi_level": 4, "value": 200},
            "o3": {"aqi_level": 6, "value": 400},
            "pm10": {"aqi_level": 6, "value": 1000},
            "pm2_5": {"aqi_level": 6, "value": 800},
            "so2": {"aqi_level": 5, "value": 600},
        },
        {
            "city": "London",
            "city_location": {"coordinates": [10, 0], "type": "Point"},
            "measurement_date": datetime(2024, 4, 23, 0, 0),
            "overall_aqi_level": 6,
            "no2": {"aqi_level": 4, "value": 125},
            "o3": {"aqi_level": 5, "value": 325},
            "pm10": {"aqi_level": 6, "value": 925},
            "pm2_5": {"aqi_level": 6, "value": 725},
            "so2": {"aqi_level": 5, "value": 525},
        },
        {
            "city": "London",
            "city_location": {"coordinates": [10, 0], "type": "Point"},
            "measurement_date": datetime(2024, 4, 24, 0, 0),
            "overall_aqi_level": 6,
            "no2": {"aqi_level": 4, "value": 225},
            "o3": {"aqi_level": 6, "value": 425},
            "pm10": {"aqi_level": 6, "value": 1225},
            "pm2_5": {"aqi_level": 6, "value": 825},
            "so2": {"aqi_level": 5, "value": 625},
        },
        {
            "city": "Paris",
            "city_location": {"coordinates": [-10, 10], "type": "Point"},
            "measurement_date": datetime(2024, 4, 23, 0, 0),
            "overall_aqi_level": 6,
            "no2": {"aqi_level": 4, "value": 150},
            "o3": {"aqi_level": 5, "value": 350},
            "pm10": {"aqi_level": 6, "value": 950},
            "pm2_5": {"aqi_level": 6, "value": 750},
            "so2": {"aqi_level": 5, "value": 550},
        },
        {
            "city": "Paris",
            "city_location": {"coordinates": [-10, 10], "type": "Point"},
            "measurement_date": datetime(2024, 4, 24, 0, 0),
            "overall_aqi_level": 6,
            "no2": {"aqi_level": 5, "value": 250},
            "o3": {"aqi_level": 6, "value": 450},
            "pm10": {"aqi_level": 6, "value": 1250},
            "pm2_5": {"aqi_level": 6, "value": 850},
            "so2": {"aqi_level": 5, "value": 650},
        },
    ]
    assert transform(input_data, default_test_cities) == expected
