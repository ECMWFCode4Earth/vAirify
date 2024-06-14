from datetime import timezone, datetime, timedelta
import pytest
from system_tests.utils.cams_utilities import delete_database_data
from scripts.run_forecast_etl import main
from system_tests.utils.cams_utilities import get_database_data
import os
from dotenv import load_dotenv
from unittest import mock

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
            "forecast_valid_time": datetime(2024, 6, 4, 3, 0, 0),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0),
            "no2_value": 10.115771485462055,
            "no2_aqi_level": 1,
            "o3_value": 63.39522524659603,
            "o3_aqi_level": 2,
            "so2_value": 2.000387638160907,
            "so2_aqi_level": 1,
            "pm10_value": 5.810208243195257,
            "pm10_aqi_level": 1,
            "pm2_5_value": 3.6327574082026914,
            "pm2_5_aqi_level": 1,
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
            "forecast_valid_time": datetime(2024, 6, 4, 0, 0, 0),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0),
            "no2_value": 0.4782831135385457,
            "no2_aqi_level": 1,
            "o3_value": 56.25565199915405,
            "o3_aqi_level": 2,
            "so2_value": 0.3777866472717213,
            "so2_aqi_level": 1,
            "pm10_value": 16.71105682154486,
            "pm10_aqi_level": 1,
            "pm2_5_value": 9.073147098209494,
            "pm2_5_aqi_level": 1,
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
            "forecast_valid_time": datetime(2024, 6, 4, 6, 0, 0),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0),
            "no2_value": 19.136068918675015,
            "no2_aqi_level": 1,
            "o3_value": 9.499161050717573,
            "o3_aqi_level": 1,
            "so2_value": 3.8678773476028074,
            "so2_aqi_level": 1,
            "pm10_value": 24.70699837214256,
            "pm10_aqi_level": 2,
            "pm2_5_value": 17.1565041916872,
            "pm2_5_aqi_level": 2,
        },
    ),
]


@mock.patch.dict(
    os.environ,
    {"FORECAST_BASE_TIME": "2024-6-4 00"},
)
@pytest.mark.parametrize("query_params, expected_values", test_cases)
def test__extreme_longitudes__to_assert_exact_values(query_params, expected_values):
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
            document["no2_aqi_level"] == expected_values["no2_aqi_level"]
        ), "no2 aqi value does not match!"
        assert (
            document["o3_value"] == expected_values["o3_value"]
        ), "o3 value does not match!"
        assert (
            document["o3_aqi_level"] == expected_values["o3_aqi_level"]
        ), "o3 aqi value does not match!"
        assert (
            document["so2_value"] == expected_values["so2_value"]
        ), "o2 value does not match!"
        assert (
            document["so2_aqi_level"] == expected_values["so2_aqi_level"]
        ), "so2 aqi value does not match!"
        assert (
            document["pm10_value"] == expected_values["pm10_value"]
        ), "pm10 value does not match!"
        assert (
            document["pm10_aqi_level"] == expected_values["pm10_aqi_level"]
        ), "pm10 aqi value does not match!"
        assert (
            document["pm2_5_value"] == expected_values["pm2_5_value"]
        ), "pm2.5 value does not match!"
        assert (
            document["pm2_5_aqi_level"] == expected_values["pm2_5_aqi_level"]
        ), "pm2_5 aqi value does not match!"


# aqi values


def test__overall_aqi_level_is_between_1_and_6():
    dict_result = get_database_data({}, "forecast_data")

    for document in dict_result:
        overall_aqi_level = document["overall_aqi_level"]
        assert 1 <= overall_aqi_level <= 6, f" {overall_aqi_level} is out of range"


def test__individual_aqi_levels_are_between_1_and_6():
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


def test__overall_aqi_level_is_highest_value_of_individual_pollutant_aqi_levels():
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


def test__that_each_document_has_location_type_city():
    dict_result = get_database_data({}, "forecast_data")

    for document in dict_result:
        assert (
            document["location_type"] == "city"
        ), f"location_type '{document['location_type']}' is not a city!"


def test__document_count_for_single_day_is_6273():
    dict_result = get_database_data({}, "forecast_data")

    assert (
        len(dict_result) == 6273
    ), f"Expected 6273 documents, but got {len(dict_result)}"


def test__created_time_exists():
    dict_result = get_database_data({}, "forecast_data")
    for document in dict_result:
        assert "created_time" in document, "A document is missing the created_time key!"

