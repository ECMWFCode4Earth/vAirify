from datetime import datetime
from freezegun import freeze_time
import mongomock
import pytest
from unittest.mock import patch

from shared.src.database.in_situ import (
    find_by_criteria,
    insert_data,
    delete_data_before,
    get_averaged,
    ApiSource,
)
from shared.src.database.locations import AirQualityLocationType
from tests.util.mock_measurement import create_mock_measurement_document


@pytest.fixture
def mock_collection():
    yield mongomock.MongoClient().db.collection


@freeze_time("2024-05-24")
def test__insert_new_data(mock_collection):
    with patch(
        "shared.src.database.mongo_db_operations.get_collection",
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
        "shared.src.database.in_situ.get_collection", return_value=mock_collection
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


@pytest.mark.parametrize(
    "params, expected_names",
    [
        (
            {
                "measurement_date_from": datetime(2024, 5, 1, 5, 0),
                "measurement_date_to": datetime(2024, 5, 1, 11, 0),
                "location_type": AirQualityLocationType.CITY,
            },
            ["London", "Paris"],
        ),
        (
            {
                "measurement_date_from": datetime(2024, 5, 1, 5, 0),
                "measurement_date_to": datetime(2024, 5, 1, 10, 59),
                "location_type": AirQualityLocationType.CITY,
            },
            ["London"],
        ),
        (
            {
                "measurement_date_from": datetime(2024, 4, 1, 4, 0),
                "measurement_date_to": datetime(2024, 4, 1, 10, 59),
                "location_type": AirQualityLocationType.CITY,
            },
            [],
        ),
        (
            {
                "measurement_date_from": datetime(2024, 5, 1, 5, 0),
                "measurement_date_to": datetime(2024, 5, 1, 11, 0),
                "location_type": AirQualityLocationType.CITY,
                "locations": ["London", "Paris"],
            },
            ["London", "Paris"],
        ),
        (
            {
                "measurement_date_from": datetime(2024, 5, 1, 5, 0),
                "measurement_date_to": datetime(2024, 5, 1, 11, 0),
                "location_type": AirQualityLocationType.CITY,
                "locations": ["London"],
            },
            ["London"],
        ),
        (
            {
                "measurement_date_from": datetime(2024, 5, 1, 5, 0),
                "measurement_date_to": datetime(2024, 5, 1, 11, 0),
                "location_type": AirQualityLocationType.CITY,
                "locations": ["London"],
                "api_source": ApiSource.OPENAQ,
            },
            ["London"],
        ),
    ],
)
def test__find_by_criteria(params, expected_names, mock_collection):
    with patch(
        "shared.src.database.in_situ.get_collection", return_value=mock_collection
    ):
        in_situ = {
            "o3": 123,
            "location_type": "city",
            "location_name": "test",
            "api_source": "OpenAQ",
        }
        mock_collection.insert_many(
            [
                {
                    **in_situ,
                    "measurement_date": datetime(2024, 5, 1, 5, 0),
                    "name": "London",
                },
                {
                    **in_situ,
                    "measurement_date": datetime(2024, 5, 1, 11, 0),
                    "name": "Paris",
                },
            ]
        )

        response = find_by_criteria(**params)

        assert list(map(lambda x: x["name"], response)) == expected_names


def test__get_averaged(mock_collection):
    with patch(
        "shared.src.database.in_situ.get_collection", return_value=mock_collection
    ):
        documents = [
            create_mock_measurement_document(
                {
                    "name": "city 1",
                    "measurement_date": datetime(2024, 6, 5, 1, 30),
                    "o3": {"value": 1.0},
                    "no2": {"value": 1.0},
                    "so2": {"value": 1.0},
                    "pm10": {"value": 1.0},
                    "pm2_5": {"value": 1.0},
                }
            ),
            # Only one pollutant measurement
            create_mock_measurement_document(
                {
                    "name": "city 1",
                    "measurement_date": datetime(2024, 6, 5, 4, 30),
                    "o3": {"value": 3.0},
                }
            ),
            # Only one pollutant measurement
            create_mock_measurement_document(
                {
                    "name": "city 1",
                    "measurement_date": datetime(2024, 6, 5, 3, 0),
                    "o3": {"value": 5.0},
                }
            ),
            # Before date range
            create_mock_measurement_document(
                {
                    "name": "city 1",
                    "measurement_date": datetime(2024, 6, 5, 1, 29),
                    "o3": {"value": 100.0},
                }
            ),
            # After date range
            create_mock_measurement_document(
                {
                    "name": "city 1",
                    "measurement_date": datetime(2024, 6, 5, 4, 31),
                    "o3": {"value": 100.0},
                }
            ),
            # Second city, pollutants missing
            create_mock_measurement_document(
                {
                    "name": "city 2",
                    "measurement_date": datetime(2024, 6, 5, 1, 30),
                    "pm10": {"value": 5.0},
                    "pm2_5": {"value": 5.0},
                }
            ),
        ]
        mock_collection.insert_many(documents)

        results = get_averaged(
            datetime(2024, 6, 5, 3, 0), 90, AirQualityLocationType.CITY
        )
        assert results == [
            {
                "measurement_base_time": datetime(2024, 6, 5, 3, 0),
                "location_type": "city",
                "name": "city 1",
                "no2": {"mean": 1.0},
                "o3": {"mean": 3.0},
                "pm2_5": {"mean": 1.0},
                "pm10": {"mean": 1.0},
                "so2": {"mean": 1.0},
            },
            {
                "measurement_base_time": datetime(2024, 6, 5, 3, 0),
                "location_type": "city",
                "name": "city 2",
                "no2": {"mean": None},
                "o3": {"mean": None},
                "pm2_5": {"mean": 5.0},
                "pm10": {"mean": 5.0},
                "so2": {"mean": None},
            },
        ]
