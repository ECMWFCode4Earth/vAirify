import mongomock
from unittest.mock import patch
from air_quality.database.locations import get_locations_by_type

mock_collection = mongomock.MongoClient().db.collection


@patch("air_quality.database.locations.get_collection", return_value=mock_collection)
def test__get_locations_by_type(mocked_fn):
    location_1 = {
        "name": "location1",
        "type": "city",
        "latitude": 0.1,
        "longitude": 0.1,
    }
    location_2 = {
        "name": "location2",
        "type": "town",
        "latitude": 0.1,
        "longitude": 0.1,
    }
    mock_collection.insert_many([location_1, location_2])

    results = get_locations_by_type("city")
    assert results == [location_1]
