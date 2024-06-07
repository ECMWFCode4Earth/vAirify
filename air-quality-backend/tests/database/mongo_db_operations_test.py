import os
from unittest import mock
from unittest.mock import patch
from air_quality.database.mongo_db_operations import get_collection


@patch("air_quality.database.mongo_db_operations.MongoClient", autospec=True)
@mock.patch.dict(
    os.environ,
    {
        "MONGO_DB_URI": "mongodb+srv://name:password@cluster0.ch5gkk4.mongodb.net/",
        "MONGO_DB_NAME": "air_quality_dashboard_db_test",
    },
)
def test_get_collection__mongo_client_has_correct_parameters(mock_mongo_client):
    get_collection("collection")
    mock_mongo_client.assert_called_once_with(
        "mongodb+srv://name:password@cluster0.ch5gkk4.mongodb.net/", tz_aware=True
    )
