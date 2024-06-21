import datetime
import pprint

import pytest
import requests
from dotenv import load_dotenv

from system_tests.data.measurement_summary_api_test_data import (
    create_in_situ_database_data_with_overrides,
)
from system_tests.utils.api_utilities import (
    format_datetime_as_string,
    get_list_of_key_values,
)
from system_tests.utils.database_utilities import (
    seed_api_test_data,
    delete_database_data,
)
from system_tests.utils.routes import Routes

# Parameter Test Data
test_city_1_site_1_2024_5_6_4_0_0 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 5, 6, 4, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 1",
        "location_name": "Test City 1, Site 1",
    }
)

test_city_2_site_1_2024_6_21_13_59_0 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 13, 59, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location_name": "Test City 2, Site 1",
    }
)

test_city_2_site_1_2024_6_21_14_0_0 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 14, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location_name": "Test City 2, Site 1",
    }
)

test_city_3_site_1_2024_6_21_14_30_0 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 14, 30, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 3",
        "location_name": "Test City 3, Site 1",
    }
)

test_city_3_site_1_2024_6_21_14_45_0 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 14, 45, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 3",
        "location_name": "Test City 3, Site 1",
    }
)

test_city_3_site_2_2024_6_21_15_30_0 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 15, 30, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 3",
        "location_name": "Test City 3, Site 2",
    }
)

test_city_1_site_1_2024_6_21_15_0_0 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 15, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 1",
        "location_name": "Test City 1, Site 1",
    }
)

test_city_2_site_2_2024_6_21_16_0_0 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 16, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location_name": "Test City 2, Site 2",
    }
)

test_city_1_site_2_2024_6_21_16_1_0 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 16, 1, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 1",
        "location_name": "Test City 1, Site 2",
    }
)

test_city_2_site_3_2024_7_28_9_0_0 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 7, 28, 9, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location_name": "Test City 2, Site 3",
    }
)

# API GET request setup
base_url = Routes.measurements_api_endpoint
location_type = "city"
date_from_string_24_6_21_14_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 6, 21, 14, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%SZ",
)
date_from_string_24_6_21_15_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 6, 21, 15, 0, 0),
    "%Y-%m-%dT%H:%M:%SZ",
)
date_to_string_24_6_21_16_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 6, 21, 16, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%SZ",
)
date_to_string_24_7_29_15_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 7, 29, 15, 0, 0), "%Y-%m-%dT%H:%M:%SZ"
)

# Test Setup
load_dotenv(".env-qa")
delete_database_data("in_situ_data")
seed_api_test_data(
    "in_situ_data",
    [
        test_city_1_site_1_2024_5_6_4_0_0,
        test_city_2_site_1_2024_6_21_13_59_0,
        test_city_2_site_1_2024_6_21_14_0_0,
        test_city_3_site_1_2024_6_21_14_30_0,
        test_city_3_site_1_2024_6_21_14_45_0,
        test_city_3_site_2_2024_6_21_15_30_0,
        test_city_1_site_1_2024_6_21_15_0_0,
        test_city_2_site_2_2024_6_21_16_0_0,
        test_city_1_site_2_2024_6_21_16_1_0,
        test_city_2_site_3_2024_7_28_9_0_0,
    ],
)


@pytest.mark.parametrize(
    "api_parameters, expected_location_names",
    [
        (
            {
                "date_from": date_from_string_24_6_21_14_0_0,
                "date_to": date_to_string_24_6_21_16_0_0,
                "location_type": location_type,
            },
            [
                test_city_1_site_1_2024_6_21_15_0_0["name"],
                test_city_2_site_1_2024_6_21_14_0_0["name"],
                test_city_2_site_2_2024_6_21_16_0_0["name"],
                test_city_3_site_1_2024_6_21_14_30_0["name"],
                test_city_3_site_1_2024_6_21_14_45_0["name"],
                test_city_3_site_2_2024_6_21_15_30_0["name"],
            ],
        ),
        (
            {
                "date_from": date_from_string_24_6_21_15_0_0,
                "date_to": date_to_string_24_7_29_15_0_0,
                "location_type": location_type,
            },
            [
                test_city_1_site_1_2024_6_21_15_0_0["name"],
                test_city_1_site_2_2024_6_21_16_1_0["name"],
                test_city_2_site_2_2024_6_21_16_0_0["name"],
                test_city_2_site_3_2024_7_28_9_0_0["name"],
                test_city_3_site_2_2024_6_21_15_30_0["name"],
            ],
        ),
    ],
)
def test__different_measurement_dates__assert_response_location_names_are_correct(
    api_parameters: dict, expected_location_names: str
):
    load_dotenv(".env-qa")
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)

    actual_location_names = get_list_of_key_values(response.json(), "location_name")
    actual_location_names.sort()

    assert actual_location_names == expected_location_names


@pytest.mark.parametrize(
    "api_parameters, expected_site_names",
    [
        (
            {
                "date_from": date_from_string_24_6_21_14_0_0,
                "date_to": date_to_string_24_6_21_16_0_0,
                "location_type": location_type,
            },
            [
                test_city_1_site_1_2024_6_21_15_0_0["location_name"],
                test_city_2_site_1_2024_6_21_14_0_0["location_name"],
                test_city_2_site_2_2024_6_21_16_0_0["location_name"],
                test_city_3_site_1_2024_6_21_14_30_0["location_name"],
                test_city_3_site_1_2024_6_21_14_45_0["location_name"],
                test_city_3_site_2_2024_6_21_15_30_0["location_name"],
            ],
        ),
        (
            {
                "date_from": date_from_string_24_6_21_15_0_0,
                "date_to": date_to_string_24_7_29_15_0_0,
                "location_type": location_type,
            },
            [
                test_city_1_site_1_2024_6_21_15_0_0["location_name"],
                test_city_1_site_2_2024_6_21_16_1_0["location_name"],
                test_city_2_site_2_2024_6_21_16_0_0["location_name"],
                test_city_2_site_3_2024_7_28_9_0_0["location_name"],
                test_city_3_site_2_2024_6_21_15_30_0["location_name"],
            ],
        ),
    ],
)
def test__different_measurement_dates__assert_response_site_names_are_correct(
    api_parameters: dict, expected_site_names: str
):
    load_dotenv(".env-qa")
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)

    actual_site_names = get_list_of_key_values(response.json(), "site_name")
    actual_site_names.sort()

    assert actual_site_names == expected_site_names


@pytest.mark.parametrize(
    "api_parameters, expected_measurement_dates",
    [
        (
            {
                "date_from": date_from_string_24_6_21_14_0_0,
                "date_to": date_to_string_24_6_21_16_0_0,
                "location_type": location_type,
            },
            [
                format_datetime_as_string(
                    test_city_2_site_1_2024_6_21_14_0_0["measurement_date"],
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
                format_datetime_as_string(
                    test_city_3_site_1_2024_6_21_14_30_0["measurement_date"],
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
                format_datetime_as_string(
                    test_city_3_site_1_2024_6_21_14_45_0["measurement_date"],
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
                format_datetime_as_string(
                    test_city_1_site_1_2024_6_21_15_0_0["measurement_date"],
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
                format_datetime_as_string(
                    test_city_3_site_2_2024_6_21_15_30_0["measurement_date"],
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
                format_datetime_as_string(
                    test_city_2_site_2_2024_6_21_16_0_0["measurement_date"],
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
            ],
        ),
        (
            {
                "date_from": date_from_string_24_6_21_15_0_0,
                "date_to": date_to_string_24_7_29_15_0_0,
                "location_type": location_type,
            },
            [
                format_datetime_as_string(
                    test_city_1_site_1_2024_6_21_15_0_0["measurement_date"],
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
                format_datetime_as_string(
                    test_city_3_site_2_2024_6_21_15_30_0["measurement_date"],
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
                format_datetime_as_string(
                    test_city_2_site_2_2024_6_21_16_0_0["measurement_date"],
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
                format_datetime_as_string(
                    test_city_1_site_2_2024_6_21_16_1_0["measurement_date"],
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
                format_datetime_as_string(
                    test_city_2_site_3_2024_7_28_9_0_0["measurement_date"],
                    "%Y-%m-%dT%H:%M:%SZ",
                ),
            ],
        ),
    ],
)
def test__different_measurement_dates__assert_response_measurement_dates_are_correct(
    api_parameters: dict, expected_measurement_dates: str
):
    load_dotenv(".env-qa")
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)

    actual_measurement_dates = get_list_of_key_values(
        response.json(), "measurement_date"
    )
    actual_measurement_dates.sort()

    assert actual_measurement_dates == expected_measurement_dates
