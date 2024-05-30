from datetime import datetime, timezone
from freezegun import freeze_time
import mongomock
import pytest
from unittest.mock import patch
from air_quality.database.forecasts import insert_data, delete_data_before

from src.air_quality.database.forecasts import get_forecast_data_from_database
from tests.database.forecast_database_test_data import forecast_from_database


@pytest.fixture
def mock_collection():
    yield mongomock.MongoClient().db.collection


@freeze_time("2024-05-24")
def test__insert_new_data(mock_collection):
    with patch(
        "air_quality.database.mongo_db_operations.get_collection",
        return_value=mock_collection,
    ):
        date = datetime.now()
        forecast_1 = {
            "forecast_base_time": date,
            "forecast_valid_time": date,
            "location_type": "city",
            "name": "location1",
            "source": "API",
            "overall_aqi_level": 1,
            "o3": {"value": 123, "aqi_level": 1},
        }
        insert_data([forecast_1])

        results = list(mock_collection.find({}))
        assert len(results) == 1
        del results[0]["_id"]
        assert results[0] == {
            **forecast_1,
            "created_time": date,
            "last_modified_time": date,
        }


def test__delete_data_before(mock_collection):
    with patch(
        "air_quality.database.forecasts.get_collection", return_value=mock_collection
    ):
        forecast = {
            "forecast_base_time": datetime.now(),
            "location_type": "city",
            "name": "location1",
            "source": "API",
            "overall_aqi_level": 1,
            "o3": {"value": 123, "aqi_level": 1},
        }
        mock_collection.insert_many(
            [
                {**forecast, "forecast_valid_time": datetime(2024, 5, 1, 0, 0)},
                {**forecast, "forecast_valid_time": datetime(2024, 5, 2, 0, 0)},
                {**forecast, "forecast_valid_time": datetime(2024, 5, 3, 0, 0)},
            ]
        )

        delete_data_before(datetime(2024, 5, 2, 0, 0))

        results = list(mock_collection.find({}))
        assert len(results) == 2


def test_get_forecast_from_database_no_location_location_name(mocker):
    database_client_mock = mongomock.MongoClient().db.collection
    database_client_mock.insert_many(forecast_from_database)
    mocker.patch(
        "src.air_quality.database.forecasts.get_collection",
        return_value=database_client_mock,
    )
    datetime.strptime("2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z")
    result = get_forecast_data_from_database(
        datetime.strptime("2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"),
        datetime.strptime("2024-05-27T23:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"),
        "city",
        datetime.strptime("2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"),
        None,
    )

    assert result == [
        {
            "base_time": datetime(2024, 5, 27, 11, 0, tzinfo=timezone.utc),
            "location_name": "Abidjan",
            "location_type": "city",
            "no2": {"aqi_level": 1, "value": 0.3145229730198031},
            "o3": {"aqi_level": 1, "value": 48.8483987731408},
            "overall_aqi_level": 2,
            "pm10": {"aqi_level": 2, "value": 24.464592631770792},
            "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
            "so2": {"aqi_level": 1, "value": 0.676714188255428},
            "valid_date": datetime(2024, 5, 27, 11, 0, tzinfo=timezone.utc),
        },
        {
            "base_time": datetime(2024, 5, 27, 11, 0, tzinfo=timezone.utc),
            "location_name": "London",
            "location_type": "city",
            "no2": {"aqi_level": 1, "value": 0.3145229730198031},
            "o3": {"aqi_level": 1, "value": 48.8483987731408},
            "overall_aqi_level": 2,
            "pm10": {"aqi_level": 2, "value": 24.464592631770792},
            "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
            "so2": {"aqi_level": 1, "value": 0.676714188255428},
            "valid_date": datetime(2024, 5, 27, 20, 0, tzinfo=timezone.utc),
        },
        {
            "base_time": datetime(2024, 5, 27, 11, 0, tzinfo=timezone.utc),
            "location_name": "London",
            "location_type": "city",
            "no2": {"aqi_level": 1, "value": 0.3145229730198031},
            "o3": {"aqi_level": 1, "value": 48.8483987731408},
            "overall_aqi_level": 2,
            "pm10": {"aqi_level": 2, "value": 24.464592631770792},
            "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
            "so2": {"aqi_level": 1, "value": 0.676714188255428},
            "valid_date": datetime(2024, 5, 27, 21, 0, tzinfo=timezone.utc),
        },
    ]


def test_get_forecast_from_database_with_location_location_name(mocker):
    database_client_mock = mongomock.MongoClient().db.collection
    database_client_mock.insert_many(forecast_from_database)
    mocker.patch(
        "src.air_quality.database.forecasts.get_collection",
        return_value=database_client_mock,
    )

    result = get_forecast_data_from_database(
        datetime.strptime("2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"),
        datetime.strptime("2024-05-27T23:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"),
        "city",
        datetime.strptime("2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"),
        "Abidjan",
    )

    assert result == [
        {
            "base_time": datetime(2024, 5, 27, 11, 0, tzinfo=timezone.utc),
            "location_name": "Abidjan",
            "location_type": "city",
            "no2": {"aqi_level": 1, "value": 0.3145229730198031},
            "o3": {"aqi_level": 1, "value": 48.8483987731408},
            "overall_aqi_level": 2,
            "pm10": {"aqi_level": 2, "value": 24.464592631770792},
            "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
            "so2": {"aqi_level": 1, "value": 0.676714188255428},
            "valid_date": datetime(2024, 5, 27, 11, 0, tzinfo=timezone.utc),
        }
    ]
