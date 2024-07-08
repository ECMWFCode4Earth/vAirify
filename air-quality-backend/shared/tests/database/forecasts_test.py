from datetime import datetime, timezone
from unittest.mock import patch

import mongomock
import pytest
from bson.tz_util import utc
from freezegun import freeze_time

from shared.src.database.forecasts import get_forecast_data_from_database
from shared.src.database.forecasts import insert_data, delete_data_before
from tests.util.mock_forecast_data import create_mock_forecast_document


@pytest.fixture
def mock_collection():
    yield mongomock.MongoClient(tz_aware=True).db.collection


@freeze_time("2024-05-24")
def test__insert_new_data(mock_collection):
    with patch(
        "shared.src.database.mongo_db_operations.get_collection",
        return_value=mock_collection,
    ):
        date = datetime.now(tz=utc)
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
        "shared.src.database.forecasts.get_collection", return_value=mock_collection
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


def test__get_forecast_from_database__no_location(mock_collection):
    with patch(
        "shared.src.database.forecasts.get_collection",
        return_value=mock_collection,
    ):
        mock_collection.insert_many(
            [
                create_mock_forecast_document({"name": "ABC"}),
                create_mock_forecast_document({"name": "DEF"}),
            ]
        )
        result = get_forecast_data_from_database(
            datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
            datetime(2024, 5, 27, 23, 0, tzinfo=timezone.utc),
            "city",
            datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
        )

        assert len(result) == 2


def test__get_forecast_from_database__with_location(mock_collection):
    with patch(
        "shared.src.database.forecasts.get_collection",
        return_value=mock_collection,
    ):
        mock_collection.insert_many(
            [
                create_mock_forecast_document({"name": "Abidjan"}),
                create_mock_forecast_document({"name": "Not Abidjan"}),
            ]
        )

        result = get_forecast_data_from_database(
            datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
            datetime(2024, 5, 27, 23, 0, tzinfo=timezone.utc),
            "city",
            datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
            "Abidjan",
        )

        assert len(result) == 1
        assert result[0]["name"] == "Abidjan"
