import os

import pytest
from dateutil.parser import parse
from unittest import mock

from freezegun import freeze_time

from air_quality.database.in_situ import InSituMeasurement, InSituPollutantReading
from system_tests.in_situ_etl_suite.open_aq_data_creator import (
    create_open_aq_measurement)
from system_tests.utils.database_utilities import (
    get_database_data, delete_database_data)
from scripts.run_in_situ_etl import main

from dotenv import load_dotenv

from system_tests.utils.file_utilities import write_to_file

open_aq_cache_location = "system_tests/in_situ_etl_suite"
collection_name = "in_situ_data"
load_dotenv()


@mock.patch.dict(
    os.environ,
    {
        "OPEN_AQ_CITIES": "London",
        "OPEN_AQ_CACHE": open_aq_cache_location
    },
)
@freeze_time("2024-05-25T13:00:00")
def test__in_situ_etl__combines_pollutants_for_location_times():
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    date1 = "2024-05-24T13:10:20+00:00"
    date2 = "2024-05-25T13:10:20+00:00"
    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"

    london_data = [
        create_measurement(date1, "no2", 1),
        create_measurement(date1, "o3", 2),
        create_measurement(date2, "no2", 3),
        create_measurement(date2, "o3", 4),
    ]

    write_to_file(london_data, london_file)
    main()
    os.remove(london_file)

    results = get_database_data(collection_name, query)
    assert len(results) == 2

    assert results[0]["measurement_date"] == parse(date1)
    assert results[0]["no2"]["value"] == 1
    assert results[0]["o3"]["value"] == 2

    assert results[1]["measurement_date"] == parse(date2)
    assert results[1]["no2"]["value"] == 3
    assert results[1]["o3"]["value"] == 4


@mock.patch.dict(
    os.environ,
    {
        "OPEN_AQ_CITIES": "London",
        "OPEN_AQ_CACHE": open_aq_cache_location
    },
)
@freeze_time("2024-05-25T13:00:00")
def test__in_situ_etl__stores_all_data_correctly():
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    date1 = "2024-05-24T13:10:20+00:00"
    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"

    london_openaq_data = [
        create_measurement(date1, "no2", 1),
        create_measurement(date1, "o3", 2),
        create_measurement(date1, "so2", 3),
        create_measurement(date1, "pm25", 4),
        create_measurement(date1, "pm10", 5),
    ]

    write_to_file(london_openaq_data, london_file)
    main()
    os.remove(london_file)

    results = get_database_data(collection_name, query)
    assert len(results) == 1
    stored: InSituMeasurement = results[0]

    assert stored["measurement_date"] == parse(date1)
    assert stored["name"] == "London"
    assert stored["location_name"] == london_openaq_data[0]["location"]
    assert stored["metadata"]["entity"] == london_openaq_data[0]["entity"]
    assert stored["metadata"]["sensor_type"] == london_openaq_data[0]["sensorType"]
    assert stored["location_type"] == "city"
    assert stored["api_source"] == "OpenAQ"
    assert stored["location"]["type"] == "point"
    assert (stored["location"]["coordinates"][0] ==
            london_openaq_data[0]["coordinates"]["longitude"])
    assert (stored["location"]["coordinates"][1] ==
            london_openaq_data[0]["coordinates"]["latitude"])

    assert_pollutant_value(stored["no2"], 1)
    assert_pollutant_value(stored["o3"], 2)
    assert_pollutant_value(stored["so2"], 3)
    assert_pollutant_value(stored["pm2_5"], 4)
    assert_pollutant_value(stored["pm10"], 5)


@mock.patch.dict(
    os.environ,
    {
        "OPEN_AQ_CITIES": "London,Melbourne",
        "OPEN_AQ_CACHE": open_aq_cache_location
    },
)
@freeze_time("2024-05-25T13:00:00")
def test__in_situ_etl__handles_multiple_cities():
    query = {"name": {"$in": ["London", "Melbourne"]}}
    delete_database_data(collection_name, query)

    date1 = "2024-05-24T13:10:20+00:00"
    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"
    melbourne_file = f"{open_aq_cache_location}/Melbourne_2024052413_2024052513.json"

    london_openaq_data = [create_measurement(date1, "no2", 123)]
    melbourne_openaq_data = [create_measurement(date1, "no2", 456, "melbourne")]

    write_to_file(london_openaq_data, london_file)
    write_to_file(melbourne_openaq_data, melbourne_file)
    main()
    os.remove(london_file)
    os.remove(melbourne_file)

    results = get_database_data(collection_name, query)
    assert len(results) == 2
    assert results[0]["name"] == "London"
    assert results[0]["no2"]["value"] == 123
    assert results[1]["name"] == "Melbourne"
    assert results[1]["no2"]["value"] == 456


@mock.patch.dict(
    os.environ,
    {
        "OPEN_AQ_CITIES": "London",
        "OPEN_AQ_CACHE": open_aq_cache_location
    },
)
@freeze_time("2024-05-25T13:00:00")
def test__in_situ_etl__invalid_data_raises_error_and_does_not_store():
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"

    london_openaq_data = [{"invalid_data": 1234}]

    write_to_file(london_openaq_data, london_file)
    with pytest.raises(KeyError):
        main()
    os.remove(london_file)

    results = get_database_data(collection_name, query)
    assert len(results) == 0


@mock.patch.dict(os.environ, {"OPEN_AQ_CITIES": "London"})
def test__in_situ_etl__calling_actual_api_returns_values_and_stores():
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    main()

    results = get_database_data(collection_name, query)
    assert results[0]["name"] == "London"
    assert results[-1]["name"] == "London"


def assert_pollutant_value(stored_data: InSituPollutantReading, expected_value: float):
    assert stored_data["value"] == expected_value
    assert stored_data["unit"] == "µg/m³"
    assert stored_data["original_value"] == expected_value
    assert stored_data["original_unit"] == "µg/m³"


def create_measurement(
        date_str: str,
        pollutant: str,
        value: float,
        location: str = "london"):
    overrides = {
        "location": f"{location}_test_station",
        "date": {
            "utc": date_str
        },
        "value": value,
        "parameter": pollutant
    }
    return create_open_aq_measurement(overrides)
