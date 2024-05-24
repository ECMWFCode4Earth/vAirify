from datetime import datetime
from freezegun import freeze_time
import mongomock
import pytest
from unittest.mock import patch
from air_quality.database.in_situ import insert_data, delete_data_before


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
        in_situ_1 = {
            "measurement_date": date,
            "name": "location1",
            "location_name": "API",
            "o3": 123,
        }
        insert_data([in_situ_1])

        results = list(mock_collection.find({}))
        assert len(results) == 1
        del results[0]["_id"]
        assert results[0] == {
            **in_situ_1,
            "created_time": date,
            "last_modified_time": date,
        }


def test__delete_data_before(mock_collection):
    with patch(
        "air_quality.database.in_situ.get_collection", return_value=mock_collection
    ):
        in_situ = {
            "name": "location1",
            "location_name": "API",
            "o3": 123,
        }
        mock_collection.insert_many(
            [
                {**in_situ, "measurement_date": datetime(2024, 5, 1, 0, 0)},
                {**in_situ, "measurement_date": datetime(2024, 5, 2, 0, 0)},
                {**in_situ, "measurement_date": datetime(2024, 5, 3, 0, 0)},
            ]
        )

        delete_data_before(datetime(2024, 5, 2, 0, 0))

        results = list(mock_collection.find({}))
        assert len(results) == 2
