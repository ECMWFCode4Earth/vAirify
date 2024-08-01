import json
import logging
import os
from datetime import datetime, timezone
from http.client import HTTPMessage
from unittest.mock import Mock

import pytest
from dateutil.parser import parse
from unittest import mock

from freezegun import freeze_time

from shared.src.database.in_situ import InSituMeasurement, InSituPollutantReading
from shared.src.database.locations import AirQualityLocationType
from etl.src.forecast.forecast_dao import fetch_forecast_data
from system_tests.in_situ_etl_suite.open_aq_data_creator import (
    create_open_aq_measurement,
)
from system_tests.utils.database_utilities import (
    get_database_data,
    delete_database_data,
    seed_api_test_data,
)
from etl.scripts.run_in_situ_etl import main

from dotenv import load_dotenv

open_aq_cache_location = "system_tests/in_situ_etl_suite"
collection_name = "in_situ_data"
load_dotenv()

# Env variables to use to mocked and cached London data - used for most tests
cache_london_env_vars = {
    "OPEN_AQ_CITIES": "London",
    "OPEN_AQ_CACHE": open_aq_cache_location,
    "STORE_GRIB_FILES": "True",
}


@mock.patch.dict(os.environ, {"OPEN_AQ_CITIES": "London"})
def test__in_situ_etl__calling_actual_api_returns_values_and_stores():
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    main()

    results = get_database_data(collection_name, query)
    assert results[0]["name"] == "London"
    assert results[-1]["name"] == "London"


@pytest.fixture(scope="module")
def ensure_forecast_cache():
    # With a time of 2024-05-25 13:14:15 our GRIB files will be for 2024-05-24 12:00:00
    with freeze_time("2024-05-25T13:14:15"):
        with mock.patch.dict(os.environ, {"STORE_GRIB_FILES": "True"}):
            # Ensure the cached files are present by fetching the grib files
            single_file = "single_level_16_from_2024-05-24_12.grib"
            multi_file = "multi_level_16_from_2024-05-24_12.grib"
            if not os.path.exists(single_file) or not os.path.exists(multi_file):
                fetch_forecast_data(datetime(2024, 5, 24, 12), 16)
        yield

        if os.path.exists(single_file):
            os.remove(single_file)
        if os.path.exists(multi_file):
            os.remove(multi_file)


@mock.patch.dict(os.environ, cache_london_env_vars)
def test__in_situ_etl__combines_pollutants_for_location_times(ensure_forecast_cache):
    delete_database_data(collection_name, {"name": "London"})

    date1 = "2024-05-24T13:14:15+00:00"
    date2 = "2024-05-25T13:14:15+00:00"
    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"

    london_data = [
        create_measurement(date1, "no2", 1),
        create_measurement(date1, "o3", 2),
        create_measurement(date2, "no2", 3),
        create_measurement(date2, "o3", 4),
    ]

    run_with_data_in_files({london_file: london_data})

    results = get_database_data(collection_name, {"name": "London"})
    assert len(results) == 2

    date1_res = retrieve_single(results, "measurement_date", parse(date1))
    assert date1_res["no2"]["value"] == 1
    assert date1_res["o3"]["value"] == 2

    date2_res = retrieve_single(results, "measurement_date", parse(date2))
    assert date2_res["no2"]["value"] == 3
    assert date2_res["o3"]["value"] == 4


@mock.patch.dict(os.environ, cache_london_env_vars)
def test__in_situ_etl__stores_all_data_correctly(ensure_forecast_cache):
    delete_database_data(collection_name, {"name": "London"})

    date1 = "2024-05-24T13:14:15+00:00"
    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"

    london_openaq_data = [
        create_measurement(date1, "no2", 1),
        create_measurement(date1, "o3", 2),
        create_measurement(date1, "so2", 3),
        create_measurement(date1, "pm25", 4),
        create_measurement(date1, "pm10", 5),
    ]

    run_with_data_in_files({london_file: london_openaq_data})

    results = get_database_data(collection_name, {"name": "London"})
    assert len(results) == 1
    stored: InSituMeasurement = results[0]

    current_time = datetime(2024, 5, 25, 13, 14, 15, tzinfo=timezone.utc)

    assert stored["measurement_date"] == parse(date1)
    assert stored["name"] == "London"
    assert stored["location_name"] == london_openaq_data[0]["location"]
    assert stored["api_source"] == "OpenAQ"
    assert stored["created_time"] == current_time
    assert stored["last_modified_time"] == current_time
    assert stored["location"]["type"] == "point"

    stored_coordinates = stored["location"]["coordinates"]
    assert stored_coordinates[0] == london_openaq_data[0]["coordinates"]["longitude"]
    assert stored_coordinates[1] == london_openaq_data[0]["coordinates"]["latitude"]

    assert stored["location_type"] == "city"
    assert stored["metadata"]["entity"] == london_openaq_data[0]["entity"]
    assert stored["metadata"]["sensor_type"] == london_openaq_data[0]["sensorType"]
    # estimated_surface_pressure_pa and estimated_temperature_k have a separate test

    assert_pollutant_value(stored["no2"], 1, "µg/m³", 1, "µg/m³")
    assert_pollutant_value(stored["o3"], 2, "µg/m³", 2, "µg/m³")
    assert_pollutant_value(stored["so2"], 3, "µg/m³", 3, "µg/m³")
    assert_pollutant_value(stored["pm2_5"], 4, "µg/m³", 4, "µg/m³")
    assert_pollutant_value(stored["pm10"], 5, "µg/m³", 5, "µg/m³")


@mock.patch.dict(os.environ, cache_london_env_vars)
def test__in_situ_etl__with_only_one_pollutant_still_stores(ensure_forecast_cache):
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    date1 = "2024-05-24T13:14:15+00:00"
    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"

    london_openaq_data = [create_measurement(date1, "pm25", 4)]

    run_with_data_in_files({london_file: london_openaq_data})

    results = get_database_data(collection_name, query)
    assert len(results) == 1
    stored: InSituMeasurement = results[0]

    assert stored["name"] == "London"
    assert_pollutant_value(stored["pm2_5"], 4, "µg/m³", 4, "µg/m³")

    assert "no2" not in stored.keys()
    assert "o3" not in stored.keys()
    assert "so2" not in stored.keys()
    assert "pm10" not in stored.keys()


@mock.patch.dict(os.environ, cache_london_env_vars)
def test__in_situ_etl__does_store_9998_pollutant_readings(ensure_forecast_cache):
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    date1 = "2024-05-24T13:14:15+00:00"
    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"

    london_openaq_data = [
        create_measurement(date1, "no2", 9998),
        create_measurement(date1, "o3", 9998),
        create_measurement(date1, "so2", 9998),
        create_measurement(date1, "pm25", 9998),
        create_measurement(date1, "pm10", 9998),
    ]

    run_with_data_in_files({london_file: london_openaq_data})

    results = get_database_data(collection_name, query)
    assert len(results) == 1

    stored: InSituMeasurement = results[0]

    assert_pollutant_value(stored["no2"], 9998, "µg/m³", 9998, "µg/m³")
    assert_pollutant_value(stored["o3"], 9998, "µg/m³", 9998, "µg/m³")
    assert_pollutant_value(stored["so2"], 9998, "µg/m³", 9998, "µg/m³")
    assert_pollutant_value(stored["pm2_5"], 9998, "µg/m³", 9998, "µg/m³")
    assert_pollutant_value(stored["pm10"], 9998, "µg/m³", 9998, "µg/m³")


@mock.patch.dict(os.environ, cache_london_env_vars)
def test__in_situ_etl__does_not_create_entry_if_all_readings_are_9999(
    ensure_forecast_cache,
):
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    date1 = "2024-05-24T13:14:15+00:00"
    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"

    london_openaq_data = [
        create_measurement(date1, "no2", 9999),
        create_measurement(date1, "o3", 9999),
        create_measurement(date1, "so2", 9999),
        create_measurement(date1, "pm25", 9999),
        create_measurement(date1, "pm10", 9999),
    ]

    run_with_data_in_files({london_file: london_openaq_data})

    results = get_database_data(collection_name, query)
    assert len(results) == 0


@mock.patch.dict(os.environ, cache_london_env_vars)
def test__in_situ_etl__does_not_store_9999_pollutant_readings(ensure_forecast_cache):
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    date1 = "2024-05-24T13:14:15+00:00"
    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"

    london_openaq_data = [
        create_measurement(date1, "no2", 9999),
        create_measurement(date1, "o3", 9999),
        create_measurement(date1, "so2", 9999),
        create_measurement(date1, "pm25", 9999),
        create_measurement(date1, "pm10", 1),
    ]

    run_with_data_in_files({london_file: london_openaq_data})

    results = get_database_data(collection_name, query)
    assert len(results) == 1

    stored: InSituMeasurement = results[0]

    assert "no2" not in stored
    assert "o3" not in stored
    assert "so2" not in stored
    assert "pm25" not in stored
    assert_pollutant_value(stored["pm10"], 1, "µg/m³", 1, "µg/m³")


@mock.patch.dict(
    os.environ,
    {
        "OPEN_AQ_CITIES": "London,Melbourne",
        "OPEN_AQ_CACHE": open_aq_cache_location,
        "STORE_GRIB_FILES": "True",
    },
)
def test__in_situ_etl__handles_multiple_cities(ensure_forecast_cache):
    query = {"name": {"$in": ["London", "Melbourne"]}}
    delete_database_data(collection_name, query)

    date1 = "2024-05-24T13:14:15+00:00"
    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"
    melbourne_file = f"{open_aq_cache_location}/Melbourne_2024052413_2024052513.json"

    london_data = [create_measurement(date1, "no2", 123)]
    melbourne_data = [create_measurement(date1, "no2", 456, "melbourne")]

    run_with_data_in_files({london_file: london_data, melbourne_file: melbourne_data})

    results = get_database_data(collection_name, query)
    assert len(results) == 2

    london_result = retrieve_single(results, "name", "London")
    melbourne_result = retrieve_single(results, "name", "Melbourne")

    assert london_result["no2"]["value"] == 123
    assert melbourne_result["no2"]["value"] == 456


@mock.patch.dict(os.environ, cache_london_env_vars)
def test__in_situ_etl__handles_update_to_existing_pollutant(ensure_forecast_cache):
    query = {"name": "London"}
    delete_database_data(collection_name, query)
    date1 = "2024-05-24T13:14:15+00:00"

    existing_measurement: InSituMeasurement = {
        "name": "London",
        "measurement_date": parse(date1),
        "location": {"type": "point", "coordinates": (1, 2)},
        "location_name": "london_test_station",
        "api_source": "test_source",
        "location_type": AirQualityLocationType.CITY.value,
        "metadata": {},
        "last_modified_time": datetime(2024, 2, 22, 12, 0, 0),
        "no2": {
            "value": 17, "unit": "test", "original_value": 17, "original_unit": "test",
        },
    }
    seed_api_test_data(collection_name, [existing_measurement])

    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"
    london_data = [create_measurement(date1, "no2", 116)]

    run_with_data_in_files({london_file: london_data})

    results = get_database_data(collection_name, query)
    assert len(results) == 1
    assert results[0]["no2"]["value"] == 116
    assert results[0]["last_modified_time"] == datetime(
        2024, 5, 25, 13, 14, 15, tzinfo=timezone.utc
    )


@mock.patch.dict(os.environ, cache_london_env_vars)
def test__in_situ_etl__handles_update_for_new_pollutant(ensure_forecast_cache):
    query = {"name": "London"}
    delete_database_data(collection_name, query)
    date1 = "2024-05-24T13:14:15+00:00"

    existing_measurement: InSituMeasurement = {
        "name": "London",
        "measurement_date": parse(date1),
        "location": {"type": "point", "coordinates": (1, 2)},
        "location_name": "london_test_station",
        "api_source": "test_source",
        "location_type": AirQualityLocationType.CITY.value,
        "metadata": {},
        "last_modified_time": datetime(2024, 2, 22, 12, 0, 0),
        "no2": {
            "value": 17, "unit": "test", "original_value": 17, "original_unit": "test",
        },
    }
    seed_api_test_data(collection_name, [existing_measurement])

    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"
    london_data = [create_measurement(date1, "so2", 116)]

    run_with_data_in_files({london_file: london_data})

    results = get_database_data(collection_name, query)
    assert len(results) == 1
    assert results[0]["no2"]["value"] == 17
    assert results[0]["so2"]["value"] == 116
    assert results[0]["last_modified_time"] == datetime(
        2024, 5, 25, 13, 14, 15, tzinfo=timezone.utc
    )


@mock.patch.dict(os.environ, cache_london_env_vars)
def test__in_situ_etl__invalid_data_raises_error_and_does_not_store(
    ensure_forecast_cache,
):
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"

    london_openaq_data = [{"invalid_data": 1234}]

    with pytest.raises(KeyError):
        run_with_data_in_files({london_file: london_openaq_data})

    results = get_database_data(collection_name, query)
    assert len(results) == 0


@mock.patch("urllib3.connectionpool.HTTPConnectionPool._get_conn")
@mock.patch.dict(os.environ, {"OPEN_AQ_CITIES": "London", "STORE_GRIB_FILES": "True"})
def test__in_situ_etl__timeouts_retry_twice_then_stop(
    mock_get_conn, caplog, ensure_forecast_cache
):
    mock_get_conn.return_value.getresponse.return_value = mock_response_for_status(408)
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    with caplog.at_level(logging.ERROR):
        main()

    assert "Response for London contained no results" in caplog.text
    assert "URL was: https://api.openaq.org/v2/measurements?limit=3000" in caplog.text
    results = get_database_data(collection_name, query)
    assert len(results) == 0
    assert len(mock_get_conn.return_value.request.mock_calls) == 3


@mock.patch("urllib3.connectionpool.HTTPConnectionPool._get_conn")
@mock.patch.dict(os.environ, {"OPEN_AQ_CITIES": "London", "STORE_GRIB_FILES": "True"})
def test__in_situ_etl__internal_error_fails_without_retry(
    mock_get_conn, caplog, ensure_forecast_cache
):
    mock_get_conn.return_value.getresponse.return_value = mock_response_for_status(500)
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    with caplog.at_level(logging.ERROR):
        main()

    assert "Response for London contained no results" in caplog.text
    assert "URL was: https://api.openaq.org/v2/measurements?limit=3000" in caplog.text
    results = get_database_data(collection_name, query)
    assert len(results) == 0
    assert len(mock_get_conn.return_value.request.mock_calls) == 1


@mock.patch("urllib3.connectionpool.HTTPConnectionPool._get_conn")
@mock.patch.dict(os.environ, {"OPEN_AQ_CITIES": "London", "STORE_GRIB_FILES": "True"})
def test__in_situ_etl__timeout_followed_by_success_returns_correctly(
    mock_get_conn, caplog, ensure_forecast_cache
):
    mock_get_conn.return_value.getresponse.side_effect = [
        mock_response_for_status(408),
        mock_response_for_status(200),
    ]
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    with caplog.at_level(logging.ERROR):
        main()

    assert "Response for London contained no results" not in caplog.text
    assert (
        "URL was: https://api.openaq.org/v2/measurements?limit=3000" not in caplog.text
    )
    results = get_database_data(collection_name, query)
    assert len(results) == 1
    assert results[0]["no2"]["value"] == 113
    assert len(mock_get_conn.return_value.request.mock_calls) == 2


@mock.patch.dict(
    os.environ,
    {"OPEN_AQ_CITIES": "Berlin", "OPEN_AQ_CACHE": open_aq_cache_location},
)
@freeze_time("2024-06-27T13:00:00")
def test__convert_ppm_to_ugm3_and_store__only_no2_so2_o3():

    # delete Berlin data, set up test data in file for Berlin
    query = {"name": "Berlin"}
    delete_database_data(collection_name, query)
    berlin_file = f"{open_aq_cache_location}/Berlin_2024062613_2024062713.json"

    berlin_openaq_data = []
    overrides = {
        "location": "berlin",
        "date": {"utc": "2024-06-26T13:10:20+00:00"},
        "value": 1000,
        "unit": "ppm",
        "coordinates": {"longitude": 13.41053, "latitude": 52.52437},
        "parameter": "no2"
    }

    berlin_openaq_data.append(create_open_aq_measurement(overrides))
    overrides["parameter"] = "o3"
    berlin_openaq_data.append(create_open_aq_measurement(overrides))
    overrides["parameter"] = "so2"
    berlin_openaq_data.append(create_open_aq_measurement(overrides))
    overrides["parameter"] = "pm25"
    berlin_openaq_data.append(create_open_aq_measurement(overrides))
    overrides["parameter"] = "pm10"
    berlin_openaq_data.append(create_open_aq_measurement(overrides))

    run_with_data_in_files({berlin_file: berlin_openaq_data})

    # investigating data stored for Berlin
    results = get_database_data(collection_name, query)
    stored: InSituMeasurement = results[0]
    estimated_surface_pressure_pa = stored["metadata"]["estimated_surface_pressure_pa"]
    estimated_temperature_k = stored["metadata"]["estimated_temperature_k"]
    estimated_surface_pressure_hpa = estimated_surface_pressure_pa / 100
    molecular_volume = (
        22.41
        * (estimated_temperature_k / 273)
        * (1013 / estimated_surface_pressure_hpa)
    )
    expected_no2_ugm3 = convert_ppm_to_ugm3(
        stored["no2"]["original_value"], 46.01, molecular_volume
    )
    expected_o3_ugm3 = convert_ppm_to_ugm3(
        stored["o3"]["original_value"], 48, molecular_volume
    )
    expected_so2_ugm3 = convert_ppm_to_ugm3(
        stored["so2"]["original_value"], 64.07, molecular_volume
    )

    assert estimated_surface_pressure_pa == 100599.76759705569
    assert estimated_temperature_k == 301.556091512509
    assert_pollutant_value(stored["no2"], expected_no2_ugm3, "µg/m³", 1000, "ppm")
    assert_pollutant_value(stored["o3"], expected_o3_ugm3, "µg/m³", 1000, "ppm")
    assert_pollutant_value(stored["so2"], expected_so2_ugm3, "µg/m³", 1000, "ppm")
    assert "pm10" not in stored
    assert "pm2_5" not in stored


#
# PRIVATE TEST FUNCTIONS
#


def mock_response_for_status(status):
    def stream_response(chunk_size, decode_content):
        result = str(create_measurement("2024-05-24T13:10:20+00:00", "no2", 113))
        result = result.replace("'", '"')  # replace single with double quotes
        return [bytes(f'{{"results": [{result}]}}', "utf-8")]

    return Mock(status=status, msg=HTTPMessage(), headers={}, stream=stream_response)


def convert_ppm_to_ugm3(
    ppm_original_value,
    molecular_weight_g_mol: float,
    molecular_volume: float,
):
    return ppm_original_value * 1000 * (molecular_weight_g_mol / molecular_volume)


def assert_pollutant_value(
    stored_data: InSituPollutantReading,
    expected_value: float,
    expected_unit: str,
    expected_original_value: float,
    expected_original_unit: str,
):
    assert stored_data["value"] == expected_value
    assert stored_data["unit"] == expected_unit
    assert stored_data["original_value"] == expected_original_value
    assert stored_data["original_unit"] == expected_original_unit


def retrieve_single(array, element_to_check, value_to_find):
    results = [x for x in array if x[element_to_check] == value_to_find]
    assert len(results) == 1
    return results[0]


def create_measurement(
    date_str: str,
    pollutant: str,
    value: float,
    location: str = "london",
    unit: str = "µg/m³",
    longitude: float = 1111,
    latitude: float = 1112,
):
    overrides = {
        "location": f"{location}_test_station",
        "date": {"utc": date_str},
        "value": value,
        "unit": unit,
        "parameter": pollutant,
        "coordinates": {"longitude": longitude, "latitude": latitude},
    }
    return create_open_aq_measurement(overrides)


def run_with_data_in_files(files_and_data: dict[str, list[dict]]):
    try:
        for (filename, data) in files_and_data.items():
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(data, f)

        main()

    finally:
        for filename in files_and_data:
            os.remove(filename)
