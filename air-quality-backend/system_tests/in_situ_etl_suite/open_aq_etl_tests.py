import logging
import os
from datetime import datetime, timezone
from http.client import HTTPMessage
from unittest.mock import Mock

import pytest
from dateutil.parser import parse
from unittest import mock

from freezegun import freeze_time

from air_quality.database.in_situ import InSituMeasurement, InSituPollutantReading
from air_quality.database.locations import AirQualityLocationType
from air_quality.etl.forecast.forecast_dao import fetch_forecast_data
from system_tests.in_situ_etl_suite.open_aq_data_creator import (
    create_open_aq_measurement)
from system_tests.utils.database_utilities import (
    get_database_data, delete_database_data, seed_api_test_data)
from scripts.run_in_situ_etl import main

from dotenv import load_dotenv

from system_tests.utils.file_utilities import write_to_file

open_aq_cache_location = "system_tests/in_situ_etl_suite"
collection_name = "in_situ_data"
load_dotenv()


@mock.patch.dict(os.environ, {"OPEN_AQ_CITIES": "London"})
def test__in_situ_etl__calling_actual_api_returns_values_and_stores():
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    main()

    results = get_database_data(collection_name, query)
    assert results[0]["name"] == "London"
    assert results[-1]["name"] == "London"


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

    date1_res = retrieve_single(results, "measurement_date", parse(date1))
    assert date1_res["no2"]["value"] == 1
    assert date1_res["o3"]["value"] == 2

    date2_res = retrieve_single(results, "measurement_date", parse(date2))
    assert date2_res["no2"]["value"] == 3
    assert date2_res["o3"]["value"] == 4


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
    assert (stored["location"]["coordinates"][0]
            == london_openaq_data[0]["coordinates"]["longitude"])
    assert (stored["location"]["coordinates"][1]
            == london_openaq_data[0]["coordinates"]["latitude"])

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

    london_result = retrieve_single(results, "name", "London")
    melbourne_result = retrieve_single(results, "name", "Melbourne")

    assert london_result["no2"]["value"] == 123
    assert melbourne_result["no2"]["value"] == 456


@mock.patch.dict(
    os.environ,
    {
        "OPEN_AQ_CITIES": "London",
        "OPEN_AQ_CACHE": open_aq_cache_location
    },
)
@freeze_time("2024-05-25T13:00:00+0000")
def test__in_situ_etl__updates_existing_data():
    query = {"name": "London"}
    delete_database_data(collection_name, query)
    date1 = "2024-05-24T13:10:20+00:00"

    existing_measurement: InSituMeasurement = {
        "name": "London",
        "measurement_date": parse(date1),
        "location": {"type": "point", "coordinates": (1, 2)},
        "location_name": "london_test_station",
        "api_source": "test",
        "location_type": AirQualityLocationType.CITY.value,
        "metadata": {},
        "last_modified_time": datetime(2024, 2, 22, 12, 0, 0),
        "no2": {
            "value": 17,
            "unit": "test",
            "original_value": 17,
            "original_unit": "test"
        }
    }
    seed_api_test_data(collection_name, [existing_measurement])

    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"
    london_data = [create_measurement(date1, "no2", 116)]

    write_to_file(london_data, london_file)
    main()
    os.remove(london_file)

    results = get_database_data(collection_name, query)
    assert len(results) == 1
    assert results[0]["no2"]["value"] == 116
    assert (results[0]["last_modified_time"]
            == datetime(2024, 5, 25, 13, 0, tzinfo=timezone.utc))


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


@pytest.fixture
def ensure_forecast_cache():
    with freeze_time("2024-05-25T13:00:00"):
        # Set up code
        # Ensure the cached files are present by fetching the grib files
        single_file = "single_level_16_from_2024-05-24_12.grib"
        multi_file = "multi_level_16_from_2024-05-24_12.grib"
        if not os.path.exists(single_file) or not os.path.exists(multi_file):
            fetch_forecast_data(datetime(2024, 5, 24, 13), 16)
        yield
        # Tear down code


@mock.patch("urllib3.connectionpool.HTTPConnectionPool._get_conn")
@mock.patch.dict(os.environ, {"OPEN_AQ_CITIES": "London"})
def test__in_situ_etl__timeouts_retry_3_times_then_stop(
        mock_get_conn,
        caplog,
        ensure_forecast_cache):
    mock_get_conn.return_value.getresponse.return_value = mock_response_for_status(408)
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    with caplog.at_level(logging.ERROR):
        main()

    assert "Response for London contained no results" in caplog.text
    results = get_database_data(collection_name, query)
    assert len(results) == 0
    assert len(mock_get_conn.return_value.request.mock_calls) == 4


@mock.patch("urllib3.connectionpool.HTTPConnectionPool._get_conn")
@mock.patch.dict(os.environ, {"OPEN_AQ_CITIES": "London"})
def test__in_situ_etl__internal_error_fails_without_retry(
        mock_get_conn,
        caplog,
        ensure_forecast_cache):
    mock_get_conn.return_value.getresponse.return_value = mock_response_for_status(500)
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    with caplog.at_level(logging.ERROR):
        main()

    assert "Response for London contained no results" in caplog.text
    results = get_database_data(collection_name, query)
    assert len(results) == 0
    assert len(mock_get_conn.return_value.request.mock_calls) == 1


@mock.patch("urllib3.connectionpool.HTTPConnectionPool._get_conn")
@mock.patch.dict(os.environ, {"OPEN_AQ_CITIES": "London"})
def test__in_situ_etl__timeout_followed_by_success_returns_correctly(
        mock_get_conn,
        caplog,
        ensure_forecast_cache):

    mock_get_conn.return_value.getresponse.side_effect = [
        mock_response_for_status(408),
        mock_response_for_status(200)
    ]
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    with caplog.at_level(logging.ERROR):
        main()

    assert "Response for London contained no results" not in caplog.text
    results = get_database_data(collection_name, query)
    assert len(results) == 1
    assert results[0]["no2"]["value"] == 113
    assert len(mock_get_conn.return_value.request.mock_calls) == 2


def mock_response_for_status(status):
    def stream_response(chunk_size, decode_content):
        result = str(create_measurement("2024-05-24T13:10:20+00:00", "no2", 113))
        result = result.replace("'", '"')  # replace single with double quotes
        return [bytes(f'{{"results": [{result}]}}', 'utf-8')]

    return Mock(status=status, msg=HTTPMessage(), headers={}, stream=stream_response)


def assert_pollutant_value(stored_data: InSituPollutantReading, expected_value: float):
    assert stored_data["value"] == expected_value
    assert stored_data["unit"] == "µg/m³"
    assert stored_data["original_value"] == expected_value
    assert stored_data["original_unit"] == "µg/m³"


def retrieve_single(array, element_to_check, value_to_find):
    results = [x for x in array if x[element_to_check] == value_to_find]
    assert len(results) == 1
    return results[0]


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
