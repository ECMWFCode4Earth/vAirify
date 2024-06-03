import mongomock
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from air_quality.api.main import app
from tests.database.forecast_database_test_data import forecast_from_database

client = TestClient(app)


@pytest.fixture
def mock_collection():
    yield mongomock.MongoClient(tz_aware=True).db.collection


def test_get_forecast_data_no_city_name(mock_collection):
    with patch(
        "air_quality.database.forecasts.get_collection",
        return_value=mock_collection,
    ):
        mock_collection.insert_many(forecast_from_database)

        valid_date_from = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
        valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
        location_type = "city"
        forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
        response = client.get(
            "/air-pollutant-forecast?valid_date_from="
            + valid_date_from
            + "&valid_date_to="
            + valid_date_to
            + "&location_type="
            + location_type
            + "&forecast_base_time="
            + forecast_base_time
        )
        assert response.status_code == 200
        assert response.json() == [
            {
                "base_time": "2024-05-27T12:00:00+00:00",
                "location_name": "Abidjan",
                "location_type": "city",
                "no2": {"aqi_level": 1, "value": 0.3145229730198031},
                "o3": {"aqi_level": 1, "value": 48.8483987731408},
                "overall_aqi_level": 2,
                "pm10": {"aqi_level": 2, "value": 24.464592631770792},
                "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
                "so2": {"aqi_level": 1, "value": 0.676714188255428},
                "valid_date": "2024-05-27T12:00:00+00:00",
            },
            {
                "base_time": "2024-05-27T12:00:00+00:00",
                "location_name": "London",
                "location_type": "city",
                "no2": {"aqi_level": 1, "value": 0.3145229730198031},
                "o3": {"aqi_level": 1, "value": 48.8483987731408},
                "overall_aqi_level": 2,
                "pm10": {"aqi_level": 2, "value": 24.464592631770792},
                "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
                "so2": {"aqi_level": 1, "value": 0.676714188255428},
                "valid_date": "2024-05-27T21:00:00+00:00",
            },
            {
                "base_time": "2024-05-27T12:00:00+00:00",
                "location_name": "London",
                "location_type": "city",
                "no2": {"aqi_level": 1, "value": 0.3145229730198031},
                "o3": {"aqi_level": 1, "value": 48.8483987731408},
                "overall_aqi_level": 2,
                "pm10": {"aqi_level": 2, "value": 24.464592631770792},
                "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
                "so2": {"aqi_level": 1, "value": 0.676714188255428},
                "valid_date": "2024-05-27T22:00:00+00:00",
            },
        ]


def test_get_forecast_data_with_city_name(mock_collection):
    with patch(
        "air_quality.database.forecasts.get_collection",
        return_value=mock_collection,
    ):
        mock_collection.insert_many(forecast_from_database)

        valid_date_from = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
        valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
        location_type = "city"
        forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
        name = "London"
        response = client.get(
            "/air-pollutant-forecast?valid_date_from="
            + valid_date_from
            + "&valid_date_to="
            + valid_date_to
            + "&location_type="
            + location_type
            + "&forecast_base_time="
            + forecast_base_time
            + "&location_name="
            + name
        )
        assert response.status_code == 200
        assert response.json() == [
            {
                "base_time": "2024-05-27T12:00:00+00:00",
                "location_name": "London",
                "location_type": "city",
                "no2": {"aqi_level": 1, "value": 0.3145229730198031},
                "o3": {"aqi_level": 1, "value": 48.8483987731408},
                "overall_aqi_level": 2,
                "pm10": {"aqi_level": 2, "value": 24.464592631770792},
                "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
                "so2": {"aqi_level": 1, "value": 0.676714188255428},
                "valid_date": "2024-05-27T21:00:00+00:00",
            },
            {
                "base_time": "2024-05-27T12:00:00+00:00",
                "location_name": "London",
                "location_type": "city",
                "no2": {"aqi_level": 1, "value": 0.3145229730198031},
                "o3": {"aqi_level": 1, "value": 48.8483987731408},
                "overall_aqi_level": 2,
                "pm10": {"aqi_level": 2, "value": 24.464592631770792},
                "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
                "so2": {"aqi_level": 1, "value": 0.676714188255428},
                "valid_date": "2024-05-27T22:00:00+00:00",
            },
        ]


@pytest.mark.parametrize(
    "valid_date_from, valid_date_to, location_type, forecast_base_time, name, expected",
    [
        (
            "2023A00.000%2B00%3A00",
            "2024-05-27T23%3A00%3A00.000%2B00%3A00",
            "city",
            "2024-05-27T12%3A00%3A00.000%2B00%3A00",
            "Abu%20Dhabi",
            [
                422,
                {
                    "detail": [
                        {
                            "ctx": {"error": "invalid date separator, expected `-`"},
                            "input": "2023A00.000+00:00",
                            "loc": ["query", "valid_date_from"],
                            "msg": "Input should be a valid datetime or date, invalid date "
                            "separator, expected `-`",
                            "type": "datetime_from_date_parsing",
                        }
                    ]
                },
            ],
        ),
        (
            "2024-05-27T00%3A00%3A00.000%2B00%3A00",
            "20200%A00",
            "city",
            "2024-05-27T12%3A00%3A00.000%2B00%3A00",
            "Abu%20Dhabi",
            [
                422,
                {
                    "detail": [
                        {
                            "ctx": {"error": "input is too short"},
                            "input": "20200�0",
                            "loc": ["query", "valid_date_to"],
                            "msg": "Input should be a valid datetime or date, input is too "
                            "short",
                            "type": "datetime_from_date_parsing",
                        }
                    ]
                },
            ],
        ),
        (
            "2024-05-27T00%3A00%3A00.000%2B00%3A00",
            "2024-05-27T00%3A00%3A00.000%2B00%3A00",
            "city",
            "212%3A0%3A0.000%2B00%3A00",
            "Abu%20Dhabi",
            [
                422,
                {
                    "detail": [
                        {
                            "ctx": {"error": "invalid character in year"},
                            "input": "212:0:0.000+00:00",
                            "loc": ["query", "forecast_base_time"],
                            "msg": "Input should be a valid datetime or date, invalid "
                            "character in year",
                            "type": "datetime_from_date_parsing",
                        }
                    ]
                },
            ],
        ),
    ],
)
def test_get_forecast_data_incorrect_input_date(
    valid_date_from, valid_date_to, location_type, forecast_base_time, name, expected
):
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == expected[0]
    assert response.json() == expected[1]


def test_get_forecast_data_no_valid_date_from():
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    location_type = "city"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?"
        "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "input": None,
                "loc": ["query", "valid_date_from"],
                "msg": "Field required",
                "type": "missing",
            }
        ]
    }


def test_get_forecast_data_no_valid_date_to():
    valid_date_from = "2024-05-27T00%3A00%3A00.000%2B00%3A00"
    location_type = "city"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "input": None,
                "loc": ["query", "valid_date_to"],
                "msg": "Field required",
                "type": "missing",
            }
        ]
    }


def test_get_forecast_data_no_forecast_base_time():
    valid_date_from = "2024-05-27T00%3A00%3A00.000%2B00%3A00"
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    location_type = "city"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "input": None,
                "loc": ["query", "forecast_base_time"],
                "msg": "Field required",
                "type": "missing",
            }
        ]
    }


def test_get_forecast_data_incorrect_location_type():
    valid_date_from = "2024-05-27T00%3A00%3A00.000%2B00%3A00"
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    location_type = "not a city"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Incorrect location type"}


def test_get_forecast_data_no_location_type():
    valid_date_from = "2024-05-27T00%3A00%3A00.000%2B00%3A00"
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "input": None,
                "loc": ["query", "location_type"],
                "msg": "Field required",
                "type": "missing",
            }
        ]
    }
