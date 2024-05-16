from copy import deepcopy
from datetime import datetime, timezone
import pytest
from src.etl.in_situ.openaq_adapter import transform_in_situ_data
from tests.etl.in_situ.mock_openaq_data import (
    openaq_dataset_multiple_locations,
    openaq_dataset_multiple_times,
    openaq_dataset_multiple_cities,
    openaq_dataset_all_pollutants,
)


@pytest.mark.parametrize(
    "input_city, expected",
    [
        (
            {"name": "Dublin", "latitude": 53.350140, "longitude": -6.266155},
            [
                {
                    "city_location": {
                        "coordinates": [-6.2140750004382745, 53.34187500024688],
                        "type": "Point",
                    },
                    "city": "Dublin",
                    "measurement_date": datetime(
                        2024, 4, 21, 0, 0, tzinfo=timezone.utc
                    ),
                    "so2": {"aqi_level": 1, "value": 14.0},
                }
            ],
        ),
        (
            {
                "name": "Dublin",
                "latitude": 52.353888999745415,
                "longitude": -5.278056000074956,
            },
            [
                {
                    "city_location": {
                        "coordinates": [-5.278056000074956, 51.353888999745415],
                        "type": "Point",
                    },
                    "city": "Dublin",
                    "measurement_date": datetime(
                        2024, 4, 21, 0, 0, tzinfo=timezone.utc
                    ),
                    "so2": {"aqi_level": 1, "value": 99.0},
                }
            ],
        ),
    ],
)
def test_transform_in_situ_data_input_multiple_internal_locations_returns_sorted_data(
    input_city, expected
):
    data = deepcopy(openaq_dataset_multiple_locations)
    data[input_city["name"]]["city"] = input_city
    result = transform_in_situ_data(data)
    assert result == expected


def test_transform_in_situ_data_input_multiple_times_returns_sorted_data():
    result = transform_in_situ_data(openaq_dataset_multiple_times)
    assert result == [
        {
            "city_location": {
                "coordinates": [-6.2140750004382745, 53.34187500024688],
                "type": "Point",
            },
            "city": "Dublin",
            "measurement_date": datetime(2024, 4, 21, 0, 0, tzinfo=timezone.utc),
            "so2": {"aqi_level": 1, "value": 14.0},
        },
        {
            "city_location": {
                "coordinates": [-6.2140750004382745, 53.34187500024688],
                "type": "Point",
            },
            "city": "Dublin",
            "measurement_date": datetime(2024, 4, 21, 1, 0, tzinfo=timezone.utc),
            "no2": {"aqi_level": 2, "value": 70.0},
            "so2": {"aqi_level": 1, "value": 44.0},
        },
        {
            "city_location": {
                "coordinates": [-6.2140750004382745, 53.34187500024688],
                "type": "Point",
            },
            "city": "Dublin",
            "measurement_date": datetime(2024, 4, 21, 2, 0, tzinfo=timezone.utc),
            "pm25": {"aqi_level": 6, "value": 889.0},
        },
    ]


def test_transform_in_situ_data_input_multiple_cities_returns_sorted_data():
    result = transform_in_situ_data(openaq_dataset_multiple_cities)
    assert result == [
        {
            "city_location": {
                "coordinates": [-6.2140750004382745, 53.34187500024688],
                "type": "Point",
            },
            "city": "Dublin",
            "measurement_date": datetime(2024, 4, 21, 0, 0, tzinfo=timezone.utc),
            "pm25": {"aqi_level": 2, "value": 11.0},
            "so2": {"aqi_level": 1, "value": 14.0},
        },
        {
            "city_location": {
                "coordinates": [-0.12588900021133392, 51.52228999923011],
                "type": "Point",
            },
            "city": "London",
            "measurement_date": datetime(2024, 4, 21, 0, 0, tzinfo=timezone.utc),
            "pm25": {"aqi_level": 5, "value": 53.0},
            "so2": {"aqi_level": 2, "value": 144.0},
        },
    ]


def test_transform_in_situ_data_input_all_five_pollutants_returns_sorted_data():
    result = transform_in_situ_data(openaq_dataset_all_pollutants)
    assert result == [
        {
            "city_location": {
                "coordinates": [-6.2140750004382745, 53.34187500024688],
                "type": "Point",
            },
            "city": "Dublin",
            "measurement_date": datetime(2024, 4, 21, 0, 0, tzinfo=timezone.utc),
            "pm25": {"aqi_level": 2, "value": 13.19},
            "pm10": {"aqi_level": 2, "value": 22.87},
            "so2": {"aqi_level": 1, "value": 0.0007099999999999999},
            "o3": {"aqi_level": 1, "value": 0.00026000000000000003},
            "no2": {"aqi_level": 1, "value": 0.021},
            "overall_aqi_level": 2,
        },
    ]
