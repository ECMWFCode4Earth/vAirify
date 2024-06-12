from datetime import timezone, datetime
import pytest
from system_tests.utils.cams_utilities import delete_database_data
from scripts.run_forecast_etl import main
from system_tests.utils.cams_utilities import get_database_data
import os
from dotenv import load_dotenv
from unittest import mock

load_dotenv()

test_cases = [
    (
        {
            "name": "Vancouver",
            "forecast_valid_time": datetime(2024, 6, 4, 3, 0, 0, tzinfo=timezone.utc),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "location_type": "city",
            "source": "cams-production",
        },
        {
            "name": "Vancouvr",
            "forecast_valid_time": datetime(2024, 6, 4, 3, 0, 0),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0),
            "no2_value": 10.115771485462055,
            "o3_value": 63.39522524659603,
            "so2_value": 2.000387638160907,
            "pm10_value": 5.810208243195257,
            "pm2_5_value": 3.6327574082026914,
        },
    ),
]


@mock.patch.dict(
    os.environ,
    {
        "FORECAST_BASE_DATE_TIME": "2024-06-04T00:00:00+000"
    },
)
@pytest.mark.parametrize("query_params, expected_values", test_cases)
def test_known_vancouver_grib(query_params, expected_values):
    delete_database_data("forecast_data")
    main()

    query = {
        "name": query_params["name"],
        "forecast_valid_time": {"$eq": query_params["forecast_valid_time"]},
        "forecast_base_time": {"$eq": query_params["forecast_base_time"]},
        "location_type": query_params["location_type"],
        "source": query_params["source"],
    }
    dict_result = get_database_data(query, "forecast_data")

    for document in dict_result:
        assert (
                document["name"] == expected_values["name"]
        ), "Name does not match the search query!"
        assert (
                document["forecast_valid_time"] == expected_values["forecast_valid_time"]
        ), "forecast_valid_time does not match!"
        assert (
                document["forecast_base_time"] == expected_values["forecast_base_time"]
        ), "forecast_base_time does not match!"
        assert (
                document["no2_value"] == expected_values["no2_value"]
        ), "no2 value does not match!"
        assert (
                document["o3_value"] == expected_values["o3_value"]
        ), "o3 value does not match!"
        assert (
                document["so2_value"] == expected_values["so2_value"]
        ), "o2 value does not match!"
        assert (
                document["pm10_value"] == expected_values["pm10_value"]
        ), "pm10 value does not match!"
        assert (
                document["pm2_5_value"] == expected_values["pm2_5_value"]
        ), "pm2.5 value does not match!"


# aqi values


def test_overall_aqi_level_is_between_1_and_6():
    dict_result = get_database_data({}, "forecast_data")

    for document in dict_result:
        overall_aqi_level = document["overall_aqi_level"]
        assert 1 <= overall_aqi_level <= 6, f" {overall_aqi_level} is out of range"


def test_individual_aqi_levels_are_between_1_and_6():
    dict_result = get_database_data({}, "forecast_data")
    pollutant_keys = [
        "no2_aqi_level",
        "so2_aqi_level",
        "o3_aqi_level",
        "pm10_aqi_level",
        "pm2_5_aqi_level",
    ]
    for document in dict_result:
        for key in pollutant_keys:
            assert 1 <= document[key] <= 6, f"{key} {document[key]} is out of range"


def test_overall_aqi_level_is_highest_value_of_pollutant_aqi_levels():
    dict_result = get_database_data({}, "forecast_data")
    pollutant_keys = [
        "no2_aqi_level",
        "so2_aqi_level",
        "o3_aqi_level",
        "pm10_aqi_level",
        "pm2_5_aqi_level",
    ]

    for document in dict_result:
        highest_aqi = max(document[key] for key in pollutant_keys)
        assert (
                document["overall_aqi_level"] == highest_aqi
        ), f"{document['overall_aqi_level']} is not equal to {highest_aqi}"


def test_that_each_document_has_location_type_city():
    query = {}
    dict_result = get_database_data(query, "forecast_data")

    for document in dict_result:
        assert (
                document["location_type"] == "city"
        ), f"location_type '{document['location_type']}' is not a city!"


def test_document_count_for_single_day_is_6273():
    query = {}
    dict_result = get_database_data(query, "forecast_data")

    assert len(dict_result) == 6273, f"Expected 6273 documents, but got {len(dict_result)}"


if __name__ == "__main__":
    test_known_vancouver_grib()
