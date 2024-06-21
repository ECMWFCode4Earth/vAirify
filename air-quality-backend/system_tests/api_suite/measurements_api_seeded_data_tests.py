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
from system_tests.utils.cams_utilities import delete_database_data
from system_tests.utils.database_utilities import seed_api_test_data
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
date_to_string_24_6_21_16_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 6, 21, 16, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%SZ",
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
            ["Test City 1", "Test City 2", "Test City 2", "Test City 3", "Test City 3"],
        ),
        # (
        #     {
        #         "date_from": date_from_string_24_6_12_14_0_0,
        #         "date_to": date_to_string_24_6_12_16_0_0,
        #         "location_type": location_type,
        #     },
        #     [],
        # ),
    ],
)
def test__different_measurement_dates__assert_location_name_filtered_appropriately(
    api_parameters: dict, expected_location_names: str
):
    load_dotenv(".env-qa")
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)

    actual_locations = get_list_of_key_values(response.json(), "location_name")
    actual_locations.sort()

    print(actual_locations)
    print(expected_location_names)
    assert actual_locations == expected_location_names
