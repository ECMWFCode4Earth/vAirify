from datetime import datetime, timezone
from unittest.mock import patch

import mongomock
import pytest
from bson.tz_util import utc
from freezegun import freeze_time

from shared.src.database.forecasts import (
    get_forecast_data_from_database,
    get_data_textures_from_database,
    get_forecast_dates_between,
    insert_data,
    delete_forecast_data_before,
    delete_data_texture_data_before
)
from shared.tests.util.mock_forecast_data import create_mock_forecast_document
from shared.tests.util.mock_texture_data import create_mock_texture_document


@pytest.fixture
def mock_collection():
    collection = mongomock.MongoClient(tz_aware=True).db.collection
    with patch(
            "shared.src.database.forecasts.get_collection", return_value=collection
    ):
        yield collection


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


def test__delete_forecasts_before(mock_collection):
    forecast = {
        "location_type": "city",
        "name": "location1",
        "source": "API",
        "overall_aqi_level": 1,
        "o3": {"value": 123, "aqi_level": 1},
    }
    mock_collection.insert_many(
        [
            {**forecast, "forecast_base_time": datetime(2024, 5, 1, 0, 0)},
            {**forecast, "forecast_base_time": datetime(2024, 5, 2, 0, 0)},
            {**forecast, "forecast_base_time": datetime(2024, 5, 3, 0, 0)},
        ]
    )

    delete_forecast_data_before(datetime(2024, 5, 2, 0, 0))

    results = list(mock_collection.find({}))
    assert len(results) == 2


def test__get_forecast_from_database__no_location(mock_collection):
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


def test__get_forecast_dates_between__database_empty(mock_collection):
    result = get_forecast_dates_between(
        datetime(2024, 5, 27, 0),
        datetime(2024, 5, 29, 0))

    assert len(result) == 0


def test__get_forecast_dates_between__dates_outside_range(mock_collection):
    mock_collection.insert_many(
        [
            create_mock_forecast_document(
                {
                    "forecast_base_time": datetime(2024, 5, 26, 23, 59, 59),
                }
            ),
            create_mock_forecast_document(
                {
                    "forecast_base_time": datetime(2024, 5, 29, 0, 0, 1),
                }
            ),
        ]
    )
    result = get_forecast_dates_between(
        datetime(2024, 5, 27, 0),
        datetime(2024, 5, 29, 0))

    assert len(result) == 0


def test__get_forecast_dates_between__dates_inside_range(mock_collection):
    mock_collection.insert_many(
        [
            create_mock_forecast_document(
                {
                    "forecast_base_time": datetime(2024, 5, 27),
                }
            ),
            create_mock_forecast_document(
                {
                    "forecast_base_time": datetime(2024, 5, 28, 1, 2, 3),
                }
            ),
            create_mock_forecast_document(
                {
                    "forecast_base_time": datetime(2024, 5, 29),
                }
            ),
        ]
    )
    result = get_forecast_dates_between(
        datetime(2024, 5, 27, 0),
        datetime(2024, 5, 29, 0))

    assert len(result) == 3


def test__get_data_textures_from_database__single_match(mock_collection):
    mock_collection.insert_many(
        [
            create_mock_texture_document(
                {
                    "forecast_base_time": datetime(
                        2024, 5, 20, 12, 0, tzinfo=timezone.utc
                    )
                }
            ),
            create_mock_texture_document(
                {
                    "forecast_base_time": datetime(
                        2024, 5, 27, 12, 0, tzinfo=timezone.utc
                    )
                }
            ),
        ]
    )
    print(mock_collection.find({}))
    result = get_data_textures_from_database(
        datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
    )

    assert len(result) == 1


def test__get_data_textures_from_database__multiple_match(mock_collection):
    mock_collection.insert_many(
        [
            create_mock_texture_document(
                {
                    "variable": "no2",
                    "forecast_base_time": datetime(
                        2024, 5, 27, 12, 0, tzinfo=timezone.utc
                    ),
                }
            ),
            create_mock_texture_document(
                {
                    "variable": "pm10",
                    "forecast_base_time": datetime(
                        2024, 5, 27, 12, 0, tzinfo=timezone.utc
                    ),
                }
            ),
        ]
    )
    print(mock_collection.find({}))
    result = get_data_textures_from_database(
        datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
    )

    assert len(result) == 2


def test__get_data_textures_from_database__no_match(mock_collection):
    mock_collection.insert_many(
        [
            create_mock_texture_document(
                {
                    "forecast_base_time": datetime(
                        2024, 5, 20, 12, 0, tzinfo=timezone.utc
                    )
                }
            ),
            create_mock_texture_document(
                {
                    "forecast_base_time": datetime(
                        2024, 5, 27, 12, 0, tzinfo=timezone.utc
                    )
                }
            ),
        ]
    )
    print(mock_collection.find({}))
    result = get_data_textures_from_database(
        datetime(2024, 5, 17, 12, 0, tzinfo=timezone.utc),
    )

    assert len(result) == 0


def test__delete_data_textures_before(mock_collection):
    date1 = datetime(2024, 5, 1, 0, 0, tzinfo=timezone.utc)
    date2 = datetime(2024, 5, 2, 0, 0, tzinfo=timezone.utc)
    date3 = datetime(2024, 5, 3, 0, 0, tzinfo=timezone.utc)

    mock_collection.insert_many(
        [
            create_mock_texture_document({"forecast_base_time": date1}),
            create_mock_texture_document({"forecast_base_time": date2}),
            create_mock_texture_document({"forecast_base_time": date3}),
        ]
    )

    delete_data_texture_data_before(date2)

    results = list(mock_collection.find({}))
    assert len(results) == 2
    assert len([x for x in results if x["forecast_base_time"] == date2]) == 1
    assert len([x for x in results if x["forecast_base_time"] == date3]) == 1
