import datetime
import statistics
import pytest
import requests
from dotenv import load_dotenv
from requests import Response
from system_tests.data.measurement_summary_api_test_data import (
    create_in_situ_database_data_with_overrides,
    create_in_situ_database_data,
    create_measurement_summary_database_data_pollutant_value,
    create_location_values,
    create_metadata_values,
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
test_city_1_site_1_2024_6_11_14_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 11, 14, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 1",
        "location_name": "Test City 1, Site 1",
    }
)
test_city_2_site_1_2024_6_12_14_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location_name": "Test City 2, Site 1",
    }
)
test_city_2_site_2_2024_6_12_15_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 12, 15, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location_name": "Test City 2, Site 2",
    }
)
test_city_3_site_1_2024_6_12_13_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 12, 13, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 3",
        "location_name": "Test City 3, Site 1",
    }
)

# Calculation Test Data

test_city_a_site_1_2024_7_20_13_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 7, 20, 13, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City A",
        "location_name": "Site 1",
        "no2": create_measurement_summary_database_data_pollutant_value(
            800, "µg/m³", 800, "µg/m³"
        ),
        "o3": create_measurement_summary_database_data_pollutant_value(
            800, "µg/m³", 800, "µg/m³"
        ),
        "pm2_5": create_measurement_summary_database_data_pollutant_value(
            800, "µg/m³", 800, "µg/m³"
        ),
        "pm10": create_measurement_summary_database_data_pollutant_value(
            800, "µg/m³", 800, "µg/m³"
        ),
        "so2": create_measurement_summary_database_data_pollutant_value(
            800, "µg/m³", 800, "µg/m³"
        ),
    }
)
test_city_a_site_2_2024_7_20_14_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 7, 20, 14, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City A",
        "location_name": "Site 2",
        "no2": create_measurement_summary_database_data_pollutant_value(
            123, "µg/m³", 123, "µg/m³"
        ),
        "o3": create_measurement_summary_database_data_pollutant_value(
            123, "µg/m³", 123, "µg/m³"
        ),
        "pm2_5": create_measurement_summary_database_data_pollutant_value(
            50, "µg/m³", 50, "µg/m³"
        ),
        "pm10": create_measurement_summary_database_data_pollutant_value(
            50, "µg/m³", 50, "µg/m³"
        ),
        "so2": create_measurement_summary_database_data_pollutant_value(
            123, "µg/m³", 123, "µg/m³"
        ),
    }
)

test_city_a_site_3_2024_7_20_15_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 7, 20, 15, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City A",
        "location_name": "Location 3",
        "no2": create_measurement_summary_database_data_pollutant_value(
            220, "µg/m³", 220, "µg/m³"
        ),
        "o3": create_measurement_summary_database_data_pollutant_value(
            220, "µg/m³", 220, "µg/m³"
        ),
        "pm2_5": create_measurement_summary_database_data_pollutant_value(
            20, "µg/m³", 20, "µg/m³"
        ),
        "pm10": create_measurement_summary_database_data_pollutant_value(
            20, "µg/m³", 20, "µg/m³"
        ),
        "so2": create_measurement_summary_database_data_pollutant_value(
            220, "µg/m³", 220, "µg/m³"
        ),
    }
)

test_city_a_site_4_2024_7_20_16_0_0: dict = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 7, 20, 16, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City A",
        "location_name": "Location 4",
        "no2": create_measurement_summary_database_data_pollutant_value(
            11, "µg/m³", 11, "µg/m³"
        ),
        "o3": create_measurement_summary_database_data_pollutant_value(
            11, "µg/m³", 11, "µg/m³"
        ),
        "pm2_5": create_measurement_summary_database_data_pollutant_value(
            11, "µg/m³", 11, "µg/m³"
        ),
        "pm10": create_measurement_summary_database_data_pollutant_value(
            11, "µg/m³", 11, "µg/m³"
        ),
        "so2": create_measurement_summary_database_data_pollutant_value(
            11, "µg/m³", 11, "µg/m³"
        ),
    }
)

test_city_b_site_1_2024_7_20_13_30_0: dict = (
    create_in_situ_database_data_with_overrides(
        {
            "measurement_date": datetime.datetime(
                2024, 7, 20, 13, 30, 0, tzinfo=datetime.timezone.utc
            ),
            "name": "Test City B",
            "location_name": "Location 1",
            "no2": create_measurement_summary_database_data_pollutant_value(
                400, "µg/m³", 400, "µg/m³"
            ),
            "o3": create_measurement_summary_database_data_pollutant_value(
                400, "µg/m³", 400, "µg/m³"
            ),
            "pm2_5": create_measurement_summary_database_data_pollutant_value(
                101, "µg/m³", 101, "µg/m³"
            ),
            "pm10": create_measurement_summary_database_data_pollutant_value(
                101, "µg/m³", 101, "µg/m³"
            ),
            "so2": create_measurement_summary_database_data_pollutant_value(
                400, "µg/m³", 400, "µg/m³"
            ),
        }
    )
)

test_city_b_site_2_2024_7_20_16_30_0: dict = (
    create_in_situ_database_data_with_overrides(
        {
            "measurement_date": datetime.datetime(
                2024, 7, 20, 16, 30, 0, tzinfo=datetime.timezone.utc
            ),
            "name": "Test City B",
            "location_name": "Location 2",
            "no2": create_measurement_summary_database_data_pollutant_value(
                200, "µg/m³", 200, "µg/m³"
            ),
            "o3": create_measurement_summary_database_data_pollutant_value(
                200, "µg/m³", 200, "µg/m³"
            ),
            "pm2_5": create_measurement_summary_database_data_pollutant_value(
                2, "µg/m³", 2, "µg/m³"
            ),
            "pm10": create_measurement_summary_database_data_pollutant_value(
                2, "µg/m³", 2, "µg/m³"
            ),
            "so2": create_measurement_summary_database_data_pollutant_value(
                200, "µg/m³", 200, "µg/m³"
            ),
        }
    )
)


test_city_c_site_1_2024_8_20_16_30_0: dict = create_in_situ_database_data(
    datetime.datetime(2024, 8, 20, 16, 30, 0, tzinfo=datetime.timezone.utc),
    "Test City C",
    "Location 1",
    200,
)
test_city_c_site_2_2024_8_20_17_0_0: dict = create_in_situ_database_data(
    datetime.datetime(2024, 8, 20, 17, 0, 0, tzinfo=datetime.timezone.utc),
    "Test City C",
    "Location 2",
    100,
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


@pytest.fixture()
def setup_test():
    # Test Setup
    load_dotenv()
    delete_database_data("in_situ_data")
    seed_api_test_data(
        "in_situ_data",
        [
            test_city_1_site_1_2024_6_11_14_0_0,
            test_city_2_site_1_2024_6_12_14_0_0,
            test_city_2_site_2_2024_6_12_15_0_0,
            test_city_3_site_1_2024_6_12_13_0_0,
            test_city_a_site_1_2024_7_20_13_0_0,
            test_city_a_site_2_2024_7_20_14_0_0,
            test_city_a_site_3_2024_7_20_15_0_0,
            test_city_a_site_4_2024_7_20_16_0_0,
            test_city_b_site_1_2024_7_20_13_30_0,
            test_city_b_site_2_2024_7_20_16_30_0,
            test_city_c_site_1_2024_8_20_16_30_0,
            test_city_c_site_2_2024_8_20_17_0_0,
            invalid_in_situ_document,
        ],
    )


# API GET request setup
base_url = Routes.measurements_summary_api_endpoint
location_type = "city"
measurement_base_time_string_24_6_12_14_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%SZ",
)
measurement_base_time_string_24_7_20_14_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 7, 20, 14, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%SZ",
)
measurement_base_time_string_24_7_20_15_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 7, 20, 15, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%SZ",
)
measurement_base_time_string_24_8_20_17_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 8, 20, 17, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%SZ",
)

measurement_time_range = 90


# Parameter Tests


@pytest.mark.parametrize(
    "api_parameters, expected_city_names",
    [
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string_24_6_12_14_0_0,
                "measurement_time_range": measurement_time_range,
            },
            [
                "Test City 2",
                "Test City 3",
            ],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 14, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            [],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 12, 29, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            [],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 12, 30, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 1"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 15, 30, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 1"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 15, 31, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            [],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 12, 29, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 12, 30, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 14, 30, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 14, 31, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 2"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 16, 30, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 2"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 16, 31, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            [],
        ),
    ],
)
def test__different_base_times__assert_data_filtered_appropriately(
    setup_test, api_parameters: dict, expected_city_names: str
):
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)
    actual_locations = get_list_of_key_values(response.json(), "location_name")
    actual_locations.sort()

    assert actual_locations == expected_city_names


@pytest.mark.parametrize(
    "api_parameters, expected_city_names",
    [
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string_24_6_12_14_0_0,
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string_24_6_12_14_0_0,
                "measurement_time_range": 60,
            },
            ["Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string_24_6_12_14_0_0,
                "measurement_time_range": 59,
            },
            ["Test City 2"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string_24_6_12_14_0_0,
                "measurement_time_range": 1440,
            },
            ["Test City 1", "Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string_24_6_12_14_0_0,
                "measurement_time_range": 1439,
            },
            ["Test City 2", "Test City 3"],
        ),
    ],
)
def test__different_measurement_time_range__assert_data_filtered_appropriately(
    setup_test, api_parameters: dict, expected_city_names: str
):
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)
    actual_locations = get_list_of_key_values(response.json(), "location_name")
    actual_locations.sort()

    assert actual_locations == expected_city_names


@pytest.mark.parametrize(
    """test_measurement_base_time_string,
    expected_test_city_a_no2_mean, expected_test_city_b_no2_mean,
    expected_test_city_a_o3_mean, expected_test_city_b_o3_mean,
    expected_test_city_a_pm10_mean, expected_test_city_b_pm10_mean,
    expected_test_city_a_pm2_5_mean, expected_test_city_b_pm2_5_mean,
    expected_test_city_a_so2_mean, expected_test_city_b_so2_mean""",
    [
        (
            measurement_base_time_string_24_7_20_14_0_0,
            statistics.mean(
                [
                    test_city_a_site_1_2024_7_20_13_0_0["no2"]["value"],
                    test_city_a_site_2_2024_7_20_14_0_0["no2"]["value"],
                    test_city_a_site_3_2024_7_20_15_0_0["no2"]["value"],
                ]
            ),
            test_city_b_site_1_2024_7_20_13_30_0["no2"]["value"],
            statistics.mean(
                [
                    test_city_a_site_1_2024_7_20_13_0_0["o3"]["value"],
                    test_city_a_site_2_2024_7_20_14_0_0["o3"]["value"],
                    test_city_a_site_3_2024_7_20_15_0_0["o3"]["value"],
                ]
            ),
            test_city_b_site_1_2024_7_20_13_30_0["o3"]["value"],
            statistics.mean(
                [
                    test_city_a_site_1_2024_7_20_13_0_0["pm10"]["value"],
                    test_city_a_site_2_2024_7_20_14_0_0["pm10"]["value"],
                    test_city_a_site_3_2024_7_20_15_0_0["pm10"]["value"],
                ]
            ),
            test_city_b_site_1_2024_7_20_13_30_0["pm10"]["value"],
            statistics.mean(
                [
                    test_city_a_site_1_2024_7_20_13_0_0["pm2_5"]["value"],
                    test_city_a_site_2_2024_7_20_14_0_0["pm2_5"]["value"],
                    test_city_a_site_3_2024_7_20_15_0_0["pm2_5"]["value"],
                ]
            ),
            test_city_b_site_1_2024_7_20_13_30_0["pm2_5"]["value"],
            statistics.mean(
                [
                    test_city_a_site_1_2024_7_20_13_0_0["so2"]["value"],
                    test_city_a_site_2_2024_7_20_14_0_0["so2"]["value"],
                    test_city_a_site_3_2024_7_20_15_0_0["so2"]["value"],
                ]
            ),
            test_city_b_site_1_2024_7_20_13_30_0["so2"]["value"],
        ),
        (
            format_datetime_as_string(
                datetime.datetime(2024, 7, 20, 15, 0, 0, tzinfo=datetime.timezone.utc),
                "%Y-%m-%dT%H:%M:%S+00:00",
            ),
            statistics.mean(
                [
                    test_city_a_site_2_2024_7_20_14_0_0["no2"]["value"],
                    test_city_a_site_3_2024_7_20_15_0_0["no2"]["value"],
                    test_city_a_site_4_2024_7_20_16_0_0["no2"]["value"],
                ]
            ),
            statistics.mean(
                [
                    test_city_b_site_1_2024_7_20_13_30_0["no2"]["value"],
                    test_city_b_site_2_2024_7_20_16_30_0["no2"]["value"],
                ]
            ),
            statistics.mean(
                [
                    test_city_a_site_2_2024_7_20_14_0_0["o3"]["value"],
                    test_city_a_site_3_2024_7_20_15_0_0["o3"]["value"],
                    test_city_a_site_4_2024_7_20_16_0_0["o3"]["value"],
                ]
            ),
            statistics.mean(
                [
                    test_city_b_site_1_2024_7_20_13_30_0["o3"]["value"],
                    test_city_b_site_2_2024_7_20_16_30_0["o3"]["value"],
                ]
            ),
            statistics.mean(
                [
                    test_city_a_site_2_2024_7_20_14_0_0["pm10"]["value"],
                    test_city_a_site_3_2024_7_20_15_0_0["pm10"]["value"],
                    test_city_a_site_4_2024_7_20_16_0_0["pm10"]["value"],
                ]
            ),
            statistics.mean(
                [
                    test_city_b_site_1_2024_7_20_13_30_0["pm10"]["value"],
                    test_city_b_site_2_2024_7_20_16_30_0["pm10"]["value"],
                ]
            ),
            statistics.mean(
                [
                    test_city_a_site_2_2024_7_20_14_0_0["pm2_5"]["value"],
                    test_city_a_site_3_2024_7_20_15_0_0["pm2_5"]["value"],
                    test_city_a_site_4_2024_7_20_16_0_0["pm2_5"]["value"],
                ]
            ),
            statistics.mean(
                [
                    test_city_b_site_1_2024_7_20_13_30_0["pm2_5"]["value"],
                    test_city_b_site_2_2024_7_20_16_30_0["pm2_5"]["value"],
                ]
            ),
            statistics.mean(
                [
                    test_city_a_site_2_2024_7_20_14_0_0["so2"]["value"],
                    test_city_a_site_3_2024_7_20_15_0_0["so2"]["value"],
                    test_city_a_site_4_2024_7_20_16_0_0["so2"]["value"],
                ]
            ),
            statistics.mean(
                [
                    test_city_b_site_1_2024_7_20_13_30_0["so2"]["value"],
                    test_city_b_site_2_2024_7_20_16_30_0["so2"]["value"],
                ]
            ),
        ),
    ],
)
def test__response_contains_correct_pollutant_mean_values(
    setup_test,
    test_measurement_base_time_string: dict,
    expected_test_city_a_no2_mean: float,
    expected_test_city_b_no2_mean: float,
    expected_test_city_a_o3_mean: float,
    expected_test_city_b_o3_mean: float,
    expected_test_city_a_pm10_mean: float,
    expected_test_city_b_pm10_mean: float,
    expected_test_city_a_pm2_5_mean: float,
    expected_test_city_b_pm2_5_mean: float,
    expected_test_city_a_so2_mean: float,
    expected_test_city_b_so2_mean: float,
):
    api_parameters: dict = {
        "location_type": location_type,
        "measurement_base_time": test_measurement_base_time_string,
        "measurement_time_range": measurement_time_range,
    }
    response: Response = requests.request(
        "GET", base_url, params=api_parameters, timeout=5.0
    )
    response_json: list = response.json()

    for city in response_json:
        response_no2_mean_value = city.get("no2").get("mean").get("value")
        response_o3_mean_value = city.get("o3").get("mean").get("value")
        response_pm10_mean_value = city.get("pm10").get("mean").get("value")
        response_pm2_5_mean_value = city.get("pm2_5").get("mean").get("value")
        response_so2_mean_value = city.get("so2").get("mean").get("value")

        match city.get("location_name"):
            case "Test City A":
                assert response_no2_mean_value == expected_test_city_a_no2_mean
                assert response_o3_mean_value == expected_test_city_a_o3_mean
                assert response_pm10_mean_value == expected_test_city_a_pm10_mean
                assert response_pm2_5_mean_value == expected_test_city_a_pm2_5_mean
                assert response_so2_mean_value == expected_test_city_a_so2_mean
            case "Test City B":
                assert response_no2_mean_value == expected_test_city_b_no2_mean
                assert response_o3_mean_value == expected_test_city_b_o3_mean
                assert response_pm10_mean_value == expected_test_city_b_pm10_mean
                assert response_pm2_5_mean_value == expected_test_city_b_pm2_5_mean
                assert response_so2_mean_value == expected_test_city_b_so2_mean
            case _:
                print("Unexpected location_name: {}".format(city))


@pytest.mark.parametrize(
    "test_measurement_base_time_string,"
    "expected_test_city_a_no2_mean_aqi_level,"
    "expected_test_city_b_no2_mean_aqi_level,"
    "expected_test_city_a_o3_mean_aqi_level,"
    "expected_test_city_b_o3_mean_aqi_level,"
    "expected_test_city_a_pm10_mean_aqi_level,"
    "expected_test_city_b_pm10_mean_aqi_level,"
    "expected_test_city_a_pm2_5_mean_aqi_level,"
    "expected_test_city_b_pm2_5_mean_aqi_level,"
    "expected_test_city_a_so2_mean_aqi_level,"
    "expected_test_city_b_so2_mean_aqi_level",
    [
        (measurement_base_time_string_24_7_20_14_0_0, 6, 6, 6, 6, 6, 5, 6, 6, 4, 4),
        (measurement_base_time_string_24_7_20_15_0_0, 3, 5, 3, 5, 2, 4, 4, 5, 2, 3),
    ],
)
def test__response_contains_correct_pollutant_mean_aqi_level(
    setup_test,
    test_measurement_base_time_string: str,
    expected_test_city_a_no2_mean_aqi_level: int,
    expected_test_city_b_no2_mean_aqi_level: int,
    expected_test_city_a_o3_mean_aqi_level: int,
    expected_test_city_b_o3_mean_aqi_level: int,
    expected_test_city_a_pm10_mean_aqi_level: int,
    expected_test_city_b_pm10_mean_aqi_level: int,
    expected_test_city_a_pm2_5_mean_aqi_level: int,
    expected_test_city_b_pm2_5_mean_aqi_level: int,
    expected_test_city_a_so2_mean_aqi_level: int,
    expected_test_city_b_so2_mean_aqi_level: int,
):
    api_parameters: dict = {
        "location_type": location_type,
        "measurement_base_time": test_measurement_base_time_string,
        "measurement_time_range": measurement_time_range,
    }

    response: Response = requests.request(
        "GET", base_url, params=api_parameters, timeout=5.0
    )
    response_json: list = response.json()

    for city in response_json:
        response_no2_mean_value_aqi_level = city.get("no2").get("mean").get("aqi_level")
        response_o3_mean_value_aqi_level = city.get("o3").get("mean").get("aqi_level")
        response_pm10_mean_value_aqi_level = (
            city.get("pm10").get("mean").get("aqi_level")
        )
        response_pm2_5_mean_value_aqi_level = (
            city.get("pm2_5").get("mean").get("aqi_level")
        )
        response_so2_mean_mean_aqi_level = city.get("so2").get("mean").get("aqi_level")

        match city.get("location_name"):
            case "Test City A":
                assert (
                    response_no2_mean_value_aqi_level
                    == expected_test_city_a_no2_mean_aqi_level
                )
                assert (
                    response_o3_mean_value_aqi_level
                    == expected_test_city_a_o3_mean_aqi_level
                )
                assert (
                    response_pm10_mean_value_aqi_level
                    == expected_test_city_a_pm10_mean_aqi_level
                )
                assert (
                    response_pm2_5_mean_value_aqi_level
                    == expected_test_city_a_pm2_5_mean_aqi_level
                )
                assert (
                    response_so2_mean_mean_aqi_level
                    == expected_test_city_a_so2_mean_aqi_level
                )
            case "Test City B":
                assert (
                    response_no2_mean_value_aqi_level
                    == expected_test_city_b_no2_mean_aqi_level
                )
                assert (
                    response_o3_mean_value_aqi_level
                    == expected_test_city_b_o3_mean_aqi_level
                )
                assert (
                    response_pm10_mean_value_aqi_level
                    == expected_test_city_b_pm10_mean_aqi_level
                )
                assert (
                    response_pm2_5_mean_value_aqi_level
                    == expected_test_city_b_pm2_5_mean_aqi_level
                )
                assert (
                    response_so2_mean_mean_aqi_level
                    == expected_test_city_b_so2_mean_aqi_level
                )
            case _:
                print("Unexpected location_name: {}".format(city))


@pytest.mark.parametrize(
    "test_measurement_base_time_string, expected_test_city_a_mean_overall_aqi,"
    "expected_test_city_b_mean_overall_aqi, expected_test_city_c_mean_overall_aqi",
    [
        (measurement_base_time_string_24_7_20_14_0_0, 6, 6, None),
        (measurement_base_time_string_24_7_20_15_0_0, 4, 5, None),
        (measurement_base_time_string_24_8_20_17_0_0, None, None, 4),
    ],
)
def test__response_contains_correct_mean_overall_aqi_level(
    setup_test,
    test_measurement_base_time_string,
    expected_test_city_a_mean_overall_aqi: float | None,
    expected_test_city_b_mean_overall_aqi: float | None,
    expected_test_city_c_mean_overall_aqi: float | None,
):
    api_parameters: dict = {
        "location_type": location_type,
        "measurement_base_time": test_measurement_base_time_string,
        "measurement_time_range": measurement_time_range,
    }

    response: Response = requests.request(
        "GET", base_url, params=api_parameters, timeout=5.0
    )
    response_json: list = response.json()

    for city in response_json:
        response_mean_overall_aqi_level = city.get("overall_aqi_level").get("mean")

        match city.get("location_name"):
            case "Test City A":
                assert (
                    response_mean_overall_aqi_level
                    == expected_test_city_a_mean_overall_aqi
                )
            case "Test City B":
                assert (
                    response_mean_overall_aqi_level
                    == expected_test_city_b_mean_overall_aqi
                )
            case "Test City C":
                assert (
                    response_mean_overall_aqi_level
                    == expected_test_city_c_mean_overall_aqi
                )
            case _:
                print("Unexpected location_name: {}".format(city))


@pytest.mark.parametrize(
    "test_measurement_base_time_string",
    [
        measurement_base_time_string_24_7_20_14_0_0,
        measurement_base_time_string_24_7_20_15_0_0,
        measurement_base_time_string_24_8_20_17_0_0,
    ],
)
def test__check_measurement_base_time_in_response_is_correct(
    setup_test,
    test_measurement_base_time_string: str,
):
    api_parameters: dict = {
        "location_type": location_type,
        "measurement_base_time": test_measurement_base_time_string,
        "measurement_time_range": measurement_time_range,
    }

    response: Response = requests.request(
        "GET", base_url, params=api_parameters, timeout=5.0
    )
    response_json: list = response.json()

    for city in response_json:
        assert city.get("measurement_base_time") == test_measurement_base_time_string


def test__invalid_document_in_database__assert_500(setup_test):
    api_parameters: dict = {
        "location_type": location_type,
        "measurement_base_time": datetime.datetime(
            2024, 1, 25, 7, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "measurement_time_range": measurement_time_range,
    }
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)
    assert response.status_code == 500
