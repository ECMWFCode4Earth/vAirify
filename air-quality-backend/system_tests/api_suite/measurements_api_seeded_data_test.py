import datetime
import pytest
import requests
from dotenv import load_dotenv
from system_tests.data.measurement_summary_api_test_data import (
    create_in_situ_database_data_with_overrides,
    create_location_values,
    create_metadata_values,
    create_measurement_summary_database_data_pollutant_value,
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
test_city_1_site_1_2024_5_6_4_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 5, 6, 4, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 1",
        "location_name": "Test City 1, Site 1",
    }
)

test_city_2_site_1_2024_6_21_13_59_0: dict = (
    create_in_situ_database_data_with_overrides(
        {
            "measurement_date": datetime.datetime(
                2024, 6, 21, 13, 59, 0, tzinfo=datetime.timezone.utc
            ),
            "name": "Test City 2",
            "location_name": "Test City 2, Site 1",
        }
    )
)

test_city_2_site_1_2024_6_21_14_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 14, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location_name": "Test City 2, Site 1",
    }
)

test_city_3_site_1_2024_6_21_14_30_0: dict = (
    create_in_situ_database_data_with_overrides(
        {
            "measurement_date": datetime.datetime(
                2024, 6, 21, 14, 30, 0, tzinfo=datetime.timezone.utc
            ),
            "name": "Test City 3",
            "location_name": "Test City 3, Site 1",
        }
    )
)

test_city_3_site_1_2024_6_21_14_45_0: dict = (
    create_in_situ_database_data_with_overrides(
        {
            "measurement_date": datetime.datetime(
                2024, 6, 21, 14, 45, 0, tzinfo=datetime.timezone.utc
            ),
            "name": "Test City 3",
            "location_name": "Test City 3, Site 1",
        }
    )
)

test_city_3_site_2_2024_6_21_15_30_0: dict = (
    create_in_situ_database_data_with_overrides(
        {
            "measurement_date": datetime.datetime(
                2024, 6, 21, 15, 30, 0, tzinfo=datetime.timezone.utc
            ),
            "name": "Test City 3",
            "location_name": "Test City 3, Site 2",
        }
    )
)

test_city_1_site_1_2024_6_21_15_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 15, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 1",
        "location": create_location_values("point", [-40, 100]),
        "location_name": "Test City 1, Site 1",
    }
)

test_city_2_site_2_2024_6_21_16_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 16, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location_name": "Test City 2, Site 2",
    }
)

test_city_1_site_2_2024_6_21_16_1_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 21, 16, 1, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 1",
        "location_name": "Test City 1, Site 2",
    }
)

test_city_2_site_3_2024_7_28_9_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 7, 28, 9, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location_name": "Test City 2, Site 3",
    }
)

test_city_5_site_1_2024_9_1_9_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 9, 1, 9, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 5",
        "location_name": "Test City 5 Site 1",
        "api_source": "Test",
    }
)

invalid_in_situ_document: dict = {
    "measurement_date": datetime.datetime(
        2024, 1, 25, 8, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "name": -7,
    "location_name": "Test In Situ Broken",
    "api_source": "OpenAQ",
    "created_time": datetime.datetime(
        2024, 1, 25, 8, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "last_modified_time": datetime.datetime(
        2024, 1, 25, 8, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "location": create_location_values("point", [54.433746, 24.424399]),
    "location_type": "city",
    "metadata": create_metadata_values(
        "Governmental Organization",
        "reference grade",
        100109.546875,
        314.317138671875,
    ),
    "no2": create_measurement_summary_database_data_pollutant_value(
        None, "µg/m³", None, "µg/m³"
    ),
    "o3": create_measurement_summary_database_data_pollutant_value(
        -48, "µg/m³", -48, "µg/m³"
    ),
    "pm2_5": create_measurement_summary_database_data_pollutant_value(
        2345723487589, "µg/m³", 2345723487589, "µg/m³"
    ),
    "pm10": create_measurement_summary_database_data_pollutant_value(
        0.7, "µg/m³", 0.7, "µg/m³"
    ),
    "so2": create_measurement_summary_database_data_pollutant_value(
        None, "µg/m³", None, "µg/m³"
    ),
}

# API GET request setup
base_url = Routes.measurements_api_endpoint
location_type = "city"
date_string_24_6_21_14_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 6, 21, 14, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%SZ",
)
date_string_24_6_21_15_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 6, 21, 15, 0, 0),
    "%Y-%m-%dT%H:%M:%SZ",
)
date_string_24_6_21_16_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 6, 21, 16, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%SZ",
)
date_string_24_7_29_15_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 7, 29, 15, 0, 0), "%Y-%m-%dT%H:%M:%SZ"
)
date_string_24_8_30_3_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 8, 30, 3, 0, 0), "%Y-%m-%dT%H:%M:%SZ"
)
date_string_24_9_2_3_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 9, 2, 3, 0, 0), "%Y-%m-%dT%H:%M:%SZ"
)
api_source_open_aq = "OpenAQ"
location_names_test_city_1 = "Test City 1"
location_names_test_city_2 = "Test City 2"
location_names_test_city_3 = "Test City 3"


@pytest.fixture()
def setup_test():
    # Test Setup
    load_dotenv()
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
            test_city_5_site_1_2024_9_1_9_0_0,
            invalid_in_situ_document,
        ],
    )


@pytest.mark.parametrize(
    "api_parameters, expected_location_names",
    [
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
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
                "date_from": date_string_24_6_21_15_0_0,
                "date_to": date_string_24_7_29_15_0_0,
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
def test__date_from_and_date_to_ranges__assert_response_location_names_are_correct(
    setup_test, api_parameters: dict, expected_location_names: str
):
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)

    actual_location_names = get_list_of_key_values(response.json(), "location_name")
    actual_location_names.sort()

    assert actual_location_names == expected_location_names


@pytest.mark.parametrize(
    "api_parameters, expected_site_names",
    [
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
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
                "date_from": date_string_24_6_21_15_0_0,
                "date_to": date_string_24_7_29_15_0_0,
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
def test__date_from_and_date_to_ranges__assert_response_site_names_are_correct(
    setup_test, api_parameters: dict, expected_site_names: str
):
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)

    actual_site_names = get_list_of_key_values(response.json(), "site_name")
    actual_site_names.sort()

    assert actual_site_names == expected_site_names


@pytest.mark.parametrize(
    "api_parameters, expected_measurement_dates",
    [
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
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
                "date_from": date_string_24_6_21_15_0_0,
                "date_to": date_string_24_7_29_15_0_0,
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
def test__date_from_and_date_to_ranges__assert_response_measurement_dates_are_correct(
    setup_test, api_parameters: dict, expected_measurement_dates: str
):
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)

    actual_measurement_dates = get_list_of_key_values(
        response.json(), "measurement_date"
    )
    actual_measurement_dates.sort()

    assert actual_measurement_dates == expected_measurement_dates


@pytest.mark.parametrize(
    "api_parameters, expected_location_names",
    [
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": location_names_test_city_1,
                "api_source": api_source_open_aq,
            },
            [test_city_1_site_1_2024_6_21_15_0_0["name"]],
        ),
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": location_names_test_city_1,
            },
            [test_city_1_site_1_2024_6_21_15_0_0["name"]],
        ),
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": location_names_test_city_3,
                "api_source": api_source_open_aq,
            },
            [
                test_city_3_site_1_2024_6_21_14_30_0["name"],
                test_city_3_site_1_2024_6_21_14_45_0["name"],
                test_city_3_site_2_2024_6_21_15_30_0["name"],
            ],
        ),
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": location_names_test_city_3,
            },
            [
                test_city_3_site_1_2024_6_21_14_30_0["name"],
                test_city_3_site_1_2024_6_21_14_45_0["name"],
                test_city_3_site_2_2024_6_21_15_30_0["name"],
            ],
        ),
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": [
                    location_names_test_city_1,
                    location_names_test_city_2,
                    location_names_test_city_3,
                ],
                "api_source": api_source_open_aq,
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
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": [
                    location_names_test_city_1,
                    location_names_test_city_2,
                    location_names_test_city_3,
                ],
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
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": ["Test City 5"],
                "api_source": api_source_open_aq,
            },
            [],
        ),
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": ["Test City 5"],
            },
            [],
        ),
    ],
)
def test__different_location_names__assert_response_location_names_are_correct(
    setup_test, api_parameters: dict, expected_location_names: str
):
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)

    actual_location_names = get_list_of_key_values(response.json(), "location_name")
    actual_location_names.sort()

    assert actual_location_names == expected_location_names


@pytest.mark.parametrize(
    "api_parameters, expected_site_names",
    [
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": location_names_test_city_1,
                "api_source": api_source_open_aq,
            },
            [test_city_1_site_1_2024_6_21_15_0_0["location_name"]],
        ),
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": location_names_test_city_1,
            },
            [test_city_1_site_1_2024_6_21_15_0_0["location_name"]],
        ),
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": location_names_test_city_3,
                "api_source": api_source_open_aq,
            },
            [
                test_city_3_site_1_2024_6_21_14_30_0["location_name"],
                test_city_3_site_1_2024_6_21_14_45_0["location_name"],
                test_city_3_site_2_2024_6_21_15_30_0["location_name"],
            ],
        ),
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": location_names_test_city_3,
            },
            [
                test_city_3_site_1_2024_6_21_14_30_0["location_name"],
                test_city_3_site_1_2024_6_21_14_45_0["location_name"],
                test_city_3_site_2_2024_6_21_15_30_0["location_name"],
            ],
        ),
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": [
                    location_names_test_city_1,
                    location_names_test_city_2,
                    location_names_test_city_3,
                ],
                "api_source": api_source_open_aq,
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
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": [
                    location_names_test_city_1,
                    location_names_test_city_2,
                    location_names_test_city_3,
                ],
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
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": ["Test City 5"],
                "api_source": api_source_open_aq,
            },
            [],
        ),
        (
            {
                "date_from": date_string_24_6_21_14_0_0,
                "date_to": date_string_24_6_21_16_0_0,
                "location_type": location_type,
                "location_names": ["Test City 5"],
            },
            [],
        ),
    ],
)
def test__different_location_names__assert_response_site_names_are_correct(
    setup_test, api_parameters: dict, expected_site_names: str
):
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)

    actual_site_names = get_list_of_key_values(response.json(), "site_name")
    actual_site_names.sort()

    assert actual_site_names == expected_site_names


@pytest.mark.parametrize(
    "api_parameters",
    [
        {
            "date_from": date_string_24_8_30_3_0_0,
            "date_to": date_string_24_9_2_3_0_0,
            "location_type": location_type,
            "location_names": [
                location_names_test_city_1,
                location_names_test_city_2,
                location_names_test_city_3,
            ],
            "api_source": "Test",
        },
        {
            "date_from": date_string_24_8_30_3_0_0,
            "date_to": date_string_24_9_2_3_0_0,
            "location_type": location_type,
            "api_source": "Test",
        },
    ],
)
def test__api_source_not_openaq__assert_fail_validation_422(
    setup_test,
    api_parameters: dict,
):
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)

    response_json = response.json()

    assert response_json["detail"][0]["msg"] == "Input should be 'OpenAQ'"
    assert response.status_code == 422


@pytest.mark.parametrize(
    "api_parameters",
    [
        {
            "date_from": date_string_24_8_30_3_0_0,
            "date_to": date_string_24_9_2_3_0_0,
            "location_type": location_type,
            "location_names": [
                "Test City 5",
            ],
        },
        {
            "date_from": date_string_24_8_30_3_0_0,
            "date_to": date_string_24_9_2_3_0_0,
            "location_type": location_type,
        },
    ],
)
def test__api_source_missing_with_invalid_db_value__assert_500(
    setup_test,
    api_parameters: dict,
):
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)
    assert response.status_code == 500


def test__valid_api_source__assert_number_of_responses_is_correct(setup_test):
    api_parameters = {
        "date_from": date_string_24_6_21_16_0_0,
        "date_to": date_string_24_7_29_15_0_0,
        "location_type": location_type,
        "location_names": [
            location_names_test_city_1,
            location_names_test_city_2,
            location_names_test_city_3,
        ],
        "api_source": api_source_open_aq,
    }
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)

    actual_site_names = get_list_of_key_values(response.json(), "site_name")
    actual_site_names.sort()

    assert actual_site_names == [
        "Test City 1, Site 2",
        "Test City 2, Site 2",
        "Test City 2, Site 3",
    ]
    assert response.status_code == 200


@pytest.mark.parametrize(
    "api_parameters",
    [
        {
            "date_from": date_string_24_6_21_14_0_0,
            "date_to": date_string_24_6_21_16_0_0,
            "location_type": location_type,
            "location_names": [
                location_names_test_city_1,
            ],
            "api_source": api_source_open_aq,
        },
        {
            "date_from": date_string_24_6_21_14_0_0,
            "date_to": date_string_24_6_21_16_0_0,
            "location_type": location_type,
            "location_names": [
                location_names_test_city_1,
            ],
        },
    ],
)
def test__assert_response_keys_and_values_are_correct(setup_test, api_parameters: dict):
    expected_response: list[dict] = [
        {
            "api_source": test_city_1_site_1_2024_6_21_15_0_0["api_source"],
            "measurement_date": format_datetime_as_string(
                test_city_1_site_1_2024_6_21_15_0_0["measurement_date"],
                "%Y-%m-%dT%H:%M:%SZ",
            ),
            "location_type": test_city_1_site_1_2024_6_21_15_0_0["location_type"],
            "location": {
                "latitude": test_city_1_site_1_2024_6_21_15_0_0["location"][
                    "coordinates"
                ][1],
                "longitude": test_city_1_site_1_2024_6_21_15_0_0["location"][
                    "coordinates"
                ][0],
            },
            "location_name": test_city_1_site_1_2024_6_21_15_0_0["name"],
            "no2": test_city_1_site_1_2024_6_21_15_0_0["no2"]["value"],
            "o3": test_city_1_site_1_2024_6_21_15_0_0["o3"]["value"],
            "pm2_5": test_city_1_site_1_2024_6_21_15_0_0["pm2_5"]["value"],
            "pm10": test_city_1_site_1_2024_6_21_15_0_0["pm10"]["value"],
            "so2": test_city_1_site_1_2024_6_21_15_0_0["so2"]["value"],
            "entity": test_city_1_site_1_2024_6_21_15_0_0["metadata"]["entity"],
            "sensor_type": test_city_1_site_1_2024_6_21_15_0_0["metadata"][
                "sensor_type"
            ],
            "site_name": test_city_1_site_1_2024_6_21_15_0_0["location_name"],
        }
    ]

    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)
    response_json = response.json()
    assert response_json == expected_response


def test__invalid_document_in_database__assert_500(setup_test):
    parameters: dict = {
        "date_from": datetime.datetime(
            2024, 1, 25, 7, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "date_to": datetime.datetime(
            2024, 1, 25, 9, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "location_type": location_type,
    }
    response = requests.request("GET", base_url, params=parameters, timeout=5.0)
    assert response.status_code == 500
