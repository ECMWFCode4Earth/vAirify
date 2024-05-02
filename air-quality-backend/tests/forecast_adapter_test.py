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
            "no2": 100,
            "o3": 300,
            "pm10": 900,
            "pm2_5": 700,
            "so2": 500,
        },
        {
            "city": "Dublin",
            "city_location": {"coordinates": [0, -10], "type": "Point"},
            "measurement_date": datetime(2024, 4, 24, 0, 0),
            "no2": 200,
            "o3": 400,
            "pm10": 1000,
            "pm2_5": 800,
            "so2": 600,
        },
        {
            "city": "London",
            "city_location": {"coordinates": [10, 0], "type": "Point"},
            "measurement_date": datetime(2024, 4, 23, 0, 0),
            "no2": 125,
            "o3": 325,
            "pm10": 925,
            "pm2_5": 725,
            "so2": 525,
        },
        {
            "city": "London",
            "city_location": {"coordinates": [10, 0], "type": "Point"},
            "measurement_date": datetime(2024, 4, 24, 0, 0),
            "no2": 225,
            "o3": 425,
            "pm10": 1225,
            "pm2_5": 825,
            "so2": 625,
        },
        {
            "city": "Paris",
            "city_location": {"coordinates": [-10, 10], "type": "Point"},
            "measurement_date": datetime(2024, 4, 23, 0, 0),
            "no2": 150,
            "o3": 350,
            "pm10": 950,
            "pm2_5": 750,
            "so2": 550,
        },
        {
            "city": "Paris",
            "city_location": {"coordinates": [-10, 10], "type": "Point"},
            "measurement_date": datetime(2024, 4, 24, 0, 0),
            "no2": 250,
            "o3": 450,
            "pm10": 1250,
            "pm2_5": 850,
            "so2": 650,
        },
    ]
    assert transform(input_data, default_test_cities) == expected
