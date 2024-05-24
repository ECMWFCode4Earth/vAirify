from datetime import datetime
from freezegun import freeze_time
import mongomock
import pytest
from unittest.mock import patch
from air_quality.database.forecasts import insert_data, delete_data_before


@pytest.fixture
def mock_collection():
    yield mongomock.MongoClient().db.collection


@freeze_time("2024-05-24")
def test__insert_new_data(mock_collection):
    with patch('air_quality.database.mongo_db_operations.get_collection', return_value=mock_collection):
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
    with patch('air_quality.database.forecasts.get_collection', return_value=mock_collection):
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
