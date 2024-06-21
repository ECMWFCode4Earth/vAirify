from datetime import timezone, datetime
import pytest
from scripts.run_forecast_etl import main
import os
from dotenv import load_dotenv
from unittest import mock

from system_tests.utils.database_utilities import delete_database_data, \
    get_database_data

load_dotenv()

test_cases = [
    # Close to -180 Longitude
    (
        {
            "name": "Vancouver",
            "forecast_valid_time": datetime(2024, 6, 4, 3, 0, 0, tzinfo=timezone.utc),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "location_type": "city",
            "source": "cams-production",
        },
        {
            "name": "Vancouver",
            "forecast_valid_time": datetime(2024, 6, 4, 3, 0, 0, tzinfo=timezone.utc),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "no2": {"value": 10.115771485462055, "aqi_level": 1},
            "o3": {"value": 63.39522524659603, "aqi_level": 2},
            "so2": {"value": 2.000387638160907, "aqi_level": 1},
            "pm10": {"value": 5.810208243195257, "aqi_level": 1},
            "pm2_5": {"value": 3.6327574082026914, "aqi_level": 1},
        },
    ),
    # Extreme Longitude Check 180
    (
        {
            "name": "Wellington",
            "forecast_valid_time": datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "location_type": "city",
            "source": "cams-production",
        },
        {
            "name": "Wellington",
            "forecast_valid_time": datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "no2": {"value": 0.4782831135385457, "aqi_level": 1},
            "o3": {"value": 56.25565199915405, "aqi_level": 2},
            "so2": {"value": 0.3777866472717213, "aqi_level": 1},
            "pm10": {"value": 16.71105682154486, "aqi_level": 1},
            "pm2_5": {"value": 9.073147098209494, "aqi_level": 1},
        },
    ),
    # Close to 0 longitude
    (
        {
            "name": "London",
            "forecast_valid_time": datetime(2024, 6, 4, 6, 0, 0, tzinfo=timezone.utc),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "location_type": "city",
            "source": "cams-production",
        },
        {
            "name": "London",
            "forecast_valid_time": datetime(2024, 6, 4, 6, 0, 0, tzinfo=timezone.utc),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "no2": {"value": 19.136068918675015, "aqi_level": 1},
            "o3": {"value": 9.499161050717573, "aqi_level": 1},
            "so2": {"value": 3.8678773476028074, "aqi_level": 1},
            "pm10": {"value": 24.70699837214256, "aqi_level": 2},
            "pm2_5": {"value": 17.1565041916872, "aqi_level": 2},
        },
    ),
]


@pytest.fixture(scope="module")
def setup_data():
    # Set up code
    with mock.patch.dict(os.environ, {"FORECAST_BASE_TIME": "2024-6-4 00"}):
        delete_database_data("forecast_data")
        main()
        yield


@pytest.mark.parametrize("query_params, expected_values", test_cases)
def test__extreme_longitudes__to_assert_exact_values(
    query_params, expected_values, setup_data
):
    query = {
        "name": query_params["name"],
        "forecast_valid_time": {"$eq": query_params["forecast_valid_time"]},
        "forecast_base_time": {"$eq": query_params["forecast_base_time"]},
        "location_type": query_params["location_type"],
        "source": query_params["source"],
    }
    stored_results = get_database_data("forecast_data", query)
    assert len(stored_results) == 1

    # Check if the expected dictionary is a subset of the one stored in the db
    _assert_dictionary_subset(expected_values, stored_results[0])

# aqi values


def test__overall_aqi_level_is_between_1_and_6(setup_data):
    dict_result = get_database_data("forecast_data")

    for document in dict_result:
        overall_aqi_level = document["overall_aqi_level"]
        assert 1 <= overall_aqi_level <= 6, f" {overall_aqi_level} is out of range"


def test__individual_aqi_levels_are_between_1_and_6(setup_data):
    dict_result = get_database_data("forecast_data")
    pollutant_keys = ["no2", "so2", "o3", "pm10", "pm2_5"]
    for document in dict_result:
        for key in pollutant_keys:
            assert 1 <= document[key]["aqi_level"] <= 6, \
                f"{key} {document[key]['aqi_level']} is out of range"


def test__overall_aqi_level_is_highest_value_of_individual_pollutant_aqi_levels(
    setup_data,
):
    dict_result = get_database_data("forecast_data")
    pollutant_keys = ["no2", "so2", "o3", "pm10", "pm2_5"]

    for document in dict_result:
        highest_aqi = max(document[key]["aqi_level"] for key in pollutant_keys)
        assert (
            document["overall_aqi_level"] == highest_aqi
        ), f"{document['overall_aqi_level']} is not equal to {highest_aqi}"


def test__that_each_document_has_location_type_city(setup_data):
    dict_result = get_database_data("forecast_data")

    for document in dict_result:
        assert (
            document["location_type"] == "city"
        ), f"location_type '{document['location_type']}' is not a city!"


def test__document_count_for_single_day_is_6273(setup_data):
    dict_result = get_database_data("forecast_data")

    assert (
        len(dict_result) == 6273
    ), f"Expected 6273 documents, but got {len(dict_result)}"


def test__created_time_exists(setup_data):
    dict_result = get_database_data("forecast_data")
    for document in dict_result:
        assert "created_time" in document, "A document is missing the created_time key!"


# Helper function to assert if a subset dictionary is contained within a superset
def _assert_dictionary_subset(subset: dict, superset: dict):
    dict_items = [(k, v) for k, v in subset.items() if isinstance(subset[k], dict)]
    non_dict_items = \
        [(k, v) for k, v in subset.items() if not isinstance(subset[k], dict)]

    assert all(superset.get(key, None) == val for key, val in non_dict_items)
    for key, value in dict_items:
        _assert_dictionary_subset(subset[key], superset[key])
