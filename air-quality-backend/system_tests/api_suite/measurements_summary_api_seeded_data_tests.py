import datetime
import pprint
import statistics

import pytest
import requests
from dotenv import load_dotenv
from requests import Response

from air_quality.database.in_situ import InSituMeasurement
from system_tests.data.measurement_summary_api_test_data import (
    api_parameter_testing_data,
)
from system_tests.utils.api_utilities import (
    format_datetime_as_string,
    seed_api_test_data,
    get_list_of_key_values,
)
from system_tests.utils.cams_utilities import delete_database_data
from system_tests.utils.routes import Routes

# API GET request
base_url = Routes.measurement_summary_api_url
location_type = "city"
measurement_base_time = datetime.datetime(
    2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc
)
measurement_base_time_string = format_datetime_as_string(
    measurement_base_time,
    "%Y-%m-%dT%H:%M:%S+00:00",
)
measurement_time_range = 90

# Test Setup
load_dotenv(".env-qa")
delete_database_data("in_situ_data")
seed_api_test_data(
    "in_situ_data",
    [
        api_parameter_testing_data["test_city_1_input_data"],
        api_parameter_testing_data["test_city_2_1_input_data"],
        api_parameter_testing_data["test_city_2_2_input_data"],
        api_parameter_testing_data["test_city_3_input_data"],
    ],
)


# Tests


@pytest.mark.parametrize(
    "api_parameters, expected_city",
    [
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string,
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
    api_parameters: dict, expected_city: str
):
    load_dotenv(".env-qa")
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)
    actual_locations = get_list_of_key_values(response.json(), "location_name")
    actual_locations.sort()
    if len(actual_locations) > 0:
        for location in actual_locations:
            index = actual_locations.index(location)
            assert location == expected_city[index]
    else:
        assert actual_locations == expected_city


@pytest.mark.parametrize(
    "api_parameters, expected_city",
    [
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string,
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string,
                "measurement_time_range": 60,
            },
            ["Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string,
                "measurement_time_range": 59,
            },
            ["Test City 2"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string,
                "measurement_time_range": 1440,
            },
            ["Test City 1", "Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string,
                "measurement_time_range": 1439,
            },
            ["Test City 2", "Test City 3"],
        ),
    ],
)
def test__different_measurement_time_range__assert_data_filtered_appropriately(
    api_parameters: dict, expected_city: str
):
    load_dotenv(".env-qa")
    response = requests.request("GET", base_url, params=api_parameters, timeout=5.0)
    actual_locations = get_list_of_key_values(response.json(), "location_name")
    actual_locations.sort()
    if len(actual_locations) > 0:
        for location in actual_locations:
            index = actual_locations.index(location)
            assert location == expected_city[index]
    else:
        assert actual_locations == expected_city


@pytest.mark.parametrize(
    """api_parameters,
    expected_test_city_1_mean_no2, expected_test_city_1_mean_o3, expected_test_city_1_mean_pm10, 
    expected_test_city_1_mean_pm2_5, expected_test_city_1_mean_so2, 
    expected_test_city_2_mean_no2, expected_test_city_2_mean_o3, expected_test_city_2_mean_pm10, 
    expected_test_city_2_mean_pm2_5, expected_test_city_2_mean_so2,
    expected_test_city_3_mean_no2, expected_test_city_3_mean_o3, expected_test_city_3_mean_pm10,
    expected_test_city_3_mean_pm2_5, expected_test_city_3_mean_so2""",
    [
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string,
                "measurement_time_range": measurement_time_range,
            },
            None,
            None,
            None,
            None,
            None,
            statistics.mean(
                [
                    api_parameter_testing_data["test_city_2_1_input_data"]["no2"][
                        "value"
                    ],
                    api_parameter_testing_data["test_city_2_2_input_data"]["no2"][
                        "value"
                    ],
                ]
            ),
            statistics.mean(
                [
                    api_parameter_testing_data["test_city_2_1_input_data"]["o3"][
                        "value"
                    ],
                    api_parameter_testing_data["test_city_2_2_input_data"]["o3"][
                        "value"
                    ],
                ]
            ),
            statistics.mean(
                [
                    api_parameter_testing_data["test_city_2_1_input_data"]["pm10"][
                        "value"
                    ],
                    api_parameter_testing_data["test_city_2_2_input_data"]["pm10"][
                        "value"
                    ],
                ]
            ),
            statistics.mean(
                [
                    api_parameter_testing_data["test_city_2_1_input_data"]["pm2_5"][
                        "value"
                    ],
                    api_parameter_testing_data["test_city_2_2_input_data"]["pm2_5"][
                        "value"
                    ],
                ]
            ),
            statistics.mean(
                [
                    api_parameter_testing_data["test_city_2_1_input_data"]["so2"][
                        "value"
                    ],
                    api_parameter_testing_data["test_city_2_2_input_data"]["so2"][
                        "value"
                    ],
                ]
            ),
            api_parameter_testing_data["test_city_3_input_data"]["no2"]["value"],
            api_parameter_testing_data["test_city_3_input_data"]["o3"]["value"],
            api_parameter_testing_data["test_city_3_input_data"]["pm10"]["value"],
            api_parameter_testing_data["test_city_3_input_data"]["pm2_5"]["value"],
            api_parameter_testing_data["test_city_3_input_data"]["so2"]["value"],
        ),
        #         (
        #             {
        #                 "location_type": location_type,
        #                 "measurement_base_time": format_datetime_as_string(
        #                     datetime.datetime(
        #                         2024, 6, 10, 14, 0, 0, tzinfo=datetime.timezone.utc
        #                     ),
        #                     "%Y-%m-%dT%H:%M:%S+00:00",
        #                 ),
        #                 "measurement_time_range": measurement_time_range,
        #             },
        #             [],
        #         ),
        #         (
        #             {
        #                 "location_type": location_type,
        #                 "measurement_base_time": format_datetime_as_string(
        #                     datetime.datetime(
        #                         2024, 6, 11, 12, 29, 0, tzinfo=datetime.timezone.utc
        #                     ),
        #                     "%Y-%m-%dT%H:%M:%S+00:00",
        #                 ),
        #                 "measurement_time_range": measurement_time_range,
        #             },
        #             [],
        #         ),
        #         (
        #             {
        #                 "location_type": location_type,
        #                 "measurement_base_time": format_datetime_as_string(
        #                     datetime.datetime(
        #                         2024, 6, 11, 12, 30, 0, tzinfo=datetime.timezone.utc
        #                     ),
        #                     "%Y-%m-%dT%H:%M:%S+00:00",
        #                 ),
        #                 "measurement_time_range": measurement_time_range,
        #             },
        #             ["Test City 1"],
        #         ),
        #         (
        #             {
        #                 "location_type": location_type,
        #                 "measurement_base_time": format_datetime_as_string(
        #                     datetime.datetime(
        #                         2024, 6, 11, 15, 30, 0, tzinfo=datetime.timezone.utc
        #                     ),
        #                     "%Y-%m-%dT%H:%M:%S+00:00",
        #                 ),
        #                 "measurement_time_range": measurement_time_range,
        #             },
        #             ["Test City 1"],
        #         ),
        #         (
        #             {
        #                 "location_type": location_type,
        #                 "measurement_base_time": format_datetime_as_string(
        #                     datetime.datetime(
        #                         2024, 6, 11, 15, 31, 0, tzinfo=datetime.timezone.utc
        #                     ),
        #                     "%Y-%m-%dT%H:%M:%S+00:00",
        #                 ),
        #                 "measurement_time_range": measurement_time_range,
        #             },
        #             [],
        #         ),
        #         (
        #             {
        #                 "location_type": location_type,
        #                 "measurement_base_time": format_datetime_as_string(
        #                     datetime.datetime(
        #                         2024, 6, 12, 12, 29, 0, tzinfo=datetime.timezone.utc
        #                     ),
        #                     "%Y-%m-%dT%H:%M:%S+00:00",
        #                 ),
        #                 "measurement_time_range": measurement_time_range,
        #             },
        #             ["Test City 3"],
        #         ),
        #         (
        #             {
        #                 "location_type": location_type,
        #                 "measurement_base_time": format_datetime_as_string(
        #                     datetime.datetime(
        #                         2024, 6, 12, 12, 30, 0, tzinfo=datetime.timezone.utc
        #                     ),
        #                     "%Y-%m-%dT%H:%M:%S+00:00",
        #                 ),
        #                 "measurement_time_range": measurement_time_range,
        #             },
        #             ["Test City 2", "Test City 3"],
        #         ),
        #         (
        #             {
        #                 "location_type": location_type,
        #                 "measurement_base_time": format_datetime_as_string(
        #                     datetime.datetime(
        #                         2024, 6, 12, 14, 30, 0, tzinfo=datetime.timezone.utc
        #                     ),
        #                     "%Y-%m-%dT%H:%M:%S+00:00",
        #                 ),
        #                 "measurement_time_range": measurement_time_range,
        #             },
        #             ["Test City 2", "Test City 3"],
        #         ),
        #         (
        #             {
        #                 "location_type": location_type,
        #                 "measurement_base_time": format_datetime_as_string(
        #                     datetime.datetime(
        #                         2024, 6, 12, 14, 31, 0, tzinfo=datetime.timezone.utc
        #                     ),
        #                     "%Y-%m-%dT%H:%M:%S+00:00",
        #                 ),
        #                 "measurement_time_range": measurement_time_range,
        #             },
        #             ["Test City 2"],
        #         ),
        #         (
        #             {
        #                 "location_type": location_type,
        #                 "measurement_base_time": format_datetime_as_string(
        #                     datetime.datetime(
        #                         2024, 6, 12, 16, 30, 0, tzinfo=datetime.timezone.utc
        #                     ),
        #                     "%Y-%m-%dT%H:%M:%S+00:00",
        #                 ),
        #                 "measurement_time_range": measurement_time_range,
        #             },
        #             ["Test City 2"],
        #         ),
        #         (
        #             {
        #                 "location_type": location_type,
        #                 "measurement_base_time": format_datetime_as_string(
        #                     datetime.datetime(
        #                         2024, 6, 12, 16, 31, 0, tzinfo=datetime.timezone.utc
        #                     ),
        #                     "%Y-%m-%dT%H:%M:%S+00:00",
        #                 ),
        #                 "measurement_time_range": measurement_time_range,
        #             },
        #             [],
        #         ),
    ],
)
def test__pollutant_mean_calculation(
    api_parameters: dict,
    expected_test_city_1_mean_no2: float | int,
    expected_test_city_1_mean_o3: float | int,
    expected_test_city_1_mean_pm10: float | int,
    expected_test_city_1_mean_pm2_5: float | int,
    expected_test_city_1_mean_so2: float | int,
    expected_test_city_2_mean_no2: float | int,
    expected_test_city_2_mean_o3: float | int,
    expected_test_city_2_mean_pm10: float | int,
    expected_test_city_2_mean_pm2_5: float | int,
    expected_test_city_2_mean_so2: float | int,
    expected_test_city_3_mean_no2: float | int,
    expected_test_city_3_mean_o3: float | int,
    expected_test_city_3_mean_pm10: float | int,
    expected_test_city_3_mean_pm2_5: float | int,
    expected_test_city_3_mean_so2: float | int,
):
    load_dotenv(".env-qa")

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
            case "Test City 1":
                assert response_no2_mean_value == expected_test_city_1_mean_no2
                assert response_o3_mean_value == expected_test_city_1_mean_o3
                assert response_pm10_mean_value == expected_test_city_1_mean_pm10
                assert response_pm2_5_mean_value == expected_test_city_1_mean_pm2_5
                assert response_so2_mean_value == expected_test_city_1_mean_so2
            case "Test City 2":
                assert response_no2_mean_value == expected_test_city_2_mean_no2
                assert response_o3_mean_value == expected_test_city_2_mean_o3
                assert response_pm10_mean_value == expected_test_city_2_mean_pm10
                assert response_pm2_5_mean_value == expected_test_city_2_mean_pm2_5
                assert response_so2_mean_value == expected_test_city_2_mean_so2
            case "Test City 3":
                assert response_no2_mean_value == expected_test_city_3_mean_no2
                assert response_o3_mean_value == expected_test_city_3_mean_o3
                assert response_pm10_mean_value == expected_test_city_3_mean_pm10
                assert response_pm2_5_mean_value == expected_test_city_3_mean_pm2_5
                assert response_so2_mean_value == expected_test_city_3_mean_so2
            case _:
                print("Unexpected location_name: {}".format(city))


# Use data without optional fields
