import datetime
import statistics
import pytest
import requests
from dotenv import load_dotenv
from requests import Response
from system_tests.data.measurement_summary_api_test_data import (
    create_in_situ_database_data_with_overrides,
    create_in_situ_database_data,
)
from system_tests.utils.api_utilities import (
    format_datetime_as_string,
    seed_api_test_data,
    get_list_of_key_values,
)
from system_tests.utils.cams_utilities import delete_database_data
from system_tests.utils.routes import Routes

# Parameter Test Data
city_1_location_1 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 11, 14, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 1",
        "location_name": "Test City 1, Site 1, All keys",
    }
)
city_2_location_1 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location_name": "Test City 2, Site 1, All keys",
    }
)
city_2_location_2 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 12, 15, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location_name": "Test City 2, Site 2, All keys",
    }
)
city_3_location_1 = create_in_situ_database_data_with_overrides(
    {
        "measurement_date": datetime.datetime(
            2024, 6, 12, 13, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 3",
        "location_name": "Test City 3, Site 1, All keys",
    }
)

# Calculation Test Data
city_a_location_1 = create_in_situ_database_data(
    datetime.datetime(2024, 7, 20, 13, 0, 0, tzinfo=datetime.timezone.utc),
    "Test City A",
    "Location 1",
    53,
    53,
    53,
    53,
    53,
)
create_in_situ_database_data_with_overrides({})
city_a_location_2 = create_in_situ_database_data(
    datetime.datetime(2024, 7, 20, 14, 0, 0, tzinfo=datetime.timezone.utc),
    "Test City A",
    "Location 2",
    102,
    102,
    102,
    102,
    102,
)
city_a_location_3 = create_in_situ_database_data(
    datetime.datetime(2024, 7, 20, 15, 0, 0, tzinfo=datetime.timezone.utc),
    "Test City A",
    "Location 3",
    220,
    220,
    220,
    220,
    220,
)
city_a_location_4 = create_in_situ_database_data(
    datetime.datetime(2024, 7, 20, 16, 0, 0, tzinfo=datetime.timezone.utc),
    "Test City A",
    "Location 1",
    9,
    9,
    9,
    9,
    9,
)
city_b_location_1 = create_in_situ_database_data(
    datetime.datetime(2024, 7, 20, 13, 30, 0, tzinfo=datetime.timezone.utc),
    "Test City B",
    "Location 1",
    400,
    400,
    400,
    400,
    400,
)
city_b_location_2 = create_in_situ_database_data(
    datetime.datetime(2024, 7, 20, 16, 30, 0, tzinfo=datetime.timezone.utc),
    "Test City B",
    "Location 2",
    303,
    303,
    303,
    303,
    303,
)

expected_mean_no2_city_a_location_1_2_3 = statistics.mean(
    [
        city_a_location_1["no2"]["value"],
        city_a_location_2["no2"]["value"],
        city_a_location_3["no2"]["value"],
    ]
)

expected_mean_no2_city_a_location_2_3_4 = statistics.mean(
    [
        city_a_location_2["no2"]["value"],
        city_a_location_3["no2"]["value"],
        city_a_location_4["no2"]["value"],
    ]
)

expected_mean_o3_city_a_location_1_2_3 = statistics.mean(
    [
        city_a_location_1["o3"]["value"],
        city_a_location_2["o3"]["value"],
        city_a_location_3["o3"]["value"],
    ]
)

expected_mean_o3_city_a_location_2_3_4 = statistics.mean(
    [
        city_a_location_2["o3"]["value"],
        city_a_location_3["o3"]["value"],
        city_a_location_4["o3"]["value"],
    ]
)

expected_mean_pm10_city_a_location_1_2_3 = statistics.mean(
    [
        city_a_location_1["pm10"]["value"],
        city_a_location_2["pm10"]["value"],
        city_a_location_3["pm10"]["value"],
    ]
)

expected_mean_pm10_city_a_location_2_3_4 = statistics.mean(
    [
        city_a_location_2["pm10"]["value"],
        city_a_location_3["pm10"]["value"],
        city_a_location_4["pm10"]["value"],
    ]
)

expected_mean_pm2_5_city_a_location_1_2_3 = statistics.mean(
    [
        city_a_location_1["pm2_5"]["value"],
        city_a_location_2["pm2_5"]["value"],
        city_a_location_3["pm2_5"]["value"],
    ]
)

expected_mean_pm2_5_city_a_location_2_3_4 = statistics.mean(
    [
        city_a_location_2["pm2_5"]["value"],
        city_a_location_3["pm2_5"]["value"],
        city_a_location_4["pm2_5"]["value"],
    ]
)

expected_mean_so2_city_a_location_1_2_3 = statistics.mean(
    [
        city_a_location_1["so2"]["value"],
        city_a_location_2["so2"]["value"],
        city_a_location_3["so2"]["value"],
    ]
)

expected_mean_so2_city_a_location_2_3_4 = statistics.mean(
    [
        city_a_location_2["so2"]["value"],
        city_a_location_3["so2"]["value"],
        city_a_location_4["so2"]["value"],
    ]
)

expected_mean_no2_city_b_location_1_2 = statistics.mean(
    [
        city_b_location_1["no2"]["value"],
        city_b_location_2["no2"]["value"],
    ]
)
expected_mean_o3_city_b_location_1_2 = statistics.mean(
    [
        city_b_location_1["o3"]["value"],
        city_b_location_2["o3"]["value"],
    ]
)

expected_mean_pm10_city_b_location_1_2 = statistics.mean(
    [
        city_b_location_1["pm10"]["value"],
        city_b_location_2["pm10"]["value"],
    ]
)

expected_mean_pm2_5_city_b_location_1_2 = statistics.mean(
    [
        city_b_location_1["pm2_5"]["value"],
        city_b_location_2["pm2_5"]["value"],
    ]
)

expected_mean_so2_city_b_location_1_2 = statistics.mean(
    [
        city_b_location_1["so2"]["value"],
        city_b_location_2["so2"]["value"],
    ]
)


# Test Setup
load_dotenv(".env-qa")
delete_database_data("in_situ_data")
seed_api_test_data(
    "in_situ_data",
    [
        city_1_location_1,
        city_2_location_1,
        city_2_location_2,
        city_3_location_1,
        city_a_location_1,
        city_a_location_2,
        city_a_location_3,
        city_a_location_4,
        city_b_location_1,
        city_b_location_2,
    ],
)

# API GET request
base_url = Routes.measurement_summary_api_url
location_type = "city"
measurement_base_time_parameter_tests = datetime.datetime(
    2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc
)
measurement_base_time_parameter_tests_string = format_datetime_as_string(
    measurement_base_time_parameter_tests,
    "%Y-%m-%dT%H:%M:%S+00:00",
)
measurement_base_time_calculation_tests = datetime.datetime(
    2024, 7, 20, 14, 0, 0, tzinfo=datetime.timezone.utc
)
measurement_base_time_calculation_tests_string = format_datetime_as_string(
    measurement_base_time_calculation_tests, "%Y-%m-%dT%H:%M:%S+00:00"
)

measurement_time_range = 90


# Parameter Tests


@pytest.mark.parametrize(
    "api_parameters, expected_city",
    [
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_parameter_tests_string,
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
                "measurement_base_time": measurement_base_time_parameter_tests_string,
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_parameter_tests_string,
                "measurement_time_range": 60,
            },
            ["Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_parameter_tests_string,
                "measurement_time_range": 59,
            },
            ["Test City 2"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_parameter_tests_string,
                "measurement_time_range": 1440,
            },
            ["Test City 1", "Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_parameter_tests_string,
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
    """test_measurement_base_time_string,
    expected_test_city_a_no2_mean, expected_test_city_b_no2_mean,
    expected_test_city_a_o3_mean, expected_test_city_b_o3_mean,
    expected_test_city_a_pm10_mean, expected_test_city_b_pm10_mean,
    expected_test_city_a_pm2_5_mean, expected_test_city_b_pm2_5_mean,
    expected_test_city_a_so2_mean, expected_test_city_b_so2_mean""",
    [
        (
            measurement_base_time_calculation_tests_string,
            expected_mean_no2_city_a_location_1_2_3,
            city_b_location_1["no2"]["value"],
            expected_mean_o3_city_a_location_1_2_3,
            city_b_location_1["o3"]["value"],
            expected_mean_pm10_city_a_location_1_2_3,
            city_b_location_1["pm10"]["value"],
            expected_mean_pm2_5_city_a_location_1_2_3,
            city_b_location_1["pm2_5"]["value"],
            expected_mean_so2_city_a_location_1_2_3,
            city_b_location_1["so2"]["value"],
        ),
        (
            format_datetime_as_string(
                datetime.datetime(2024, 7, 20, 15, 0, 0, tzinfo=datetime.timezone.utc),
                "%Y-%m-%dT%H:%M:%S+00:00",
            ),
            expected_mean_no2_city_a_location_2_3_4,
            expected_mean_no2_city_b_location_1_2,
            expected_mean_o3_city_a_location_2_3_4,
            expected_mean_o3_city_b_location_1_2,
            expected_mean_pm10_city_a_location_2_3_4,
            expected_mean_pm10_city_b_location_1_2,
            expected_mean_pm2_5_city_a_location_2_3_4,
            expected_mean_pm2_5_city_b_location_1_2,
            expected_mean_so2_city_a_location_2_3_4,
            expected_mean_so2_city_b_location_1_2,
        ),
    ],
)
def test__response_contains_correct_pollutant_mean_values(
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
    load_dotenv(".env-qa")
    api_parameters = {
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
    """test_measurement_base_time_string,
    expected_test_city_a_no2_mean_aqi_level, expected_test_city_b_no2_mean_aqi_level,
    expected_test_city_a_o3_mean_aqi_level, expected_test_city_b_o3_mean_aqi_level,
    expected_test_city_a_pm10_mean_aqi_level, expected_test_city_b_pm10_mean_aqi_level,
    expected_test_city_a_pm2_5_mean_aqi_level, expected_test_city_b_pm2_5_mean_aqi_level,
    expected_test_city_a_so2_mean_aqi_level, expected_test_city_b_so2_mean_aqi_level""",
    [
        (
            measurement_base_time_calculation_tests_string,
            expected_mean_no2_city_a_location_1_2_3,
            city_b_location_1["no2"]["value"],
            expected_mean_o3_city_a_location_1_2_3,
            city_b_location_1["o3"]["value"],
            expected_mean_pm10_city_a_location_1_2_3,
            city_b_location_1["pm10"]["value"],
            expected_mean_pm2_5_city_a_location_1_2_3,
            city_b_location_1["pm2_5"]["value"],
            expected_mean_so2_city_a_location_1_2_3,
            city_b_location_1["so2"]["value"],
        ),
        (
            format_datetime_as_string(
                datetime.datetime(2024, 7, 20, 15, 0, 0, tzinfo=datetime.timezone.utc),
                "%Y-%m-%dT%H:%M:%S+00:00",
            ),
            expected_mean_no2_city_a_location_2_3_4,
            expected_mean_no2_city_b_location_1_2,
            expected_mean_o3_city_a_location_2_3_4,
            expected_mean_o3_city_b_location_1_2,
            expected_mean_pm10_city_a_location_2_3_4,
            expected_mean_pm10_city_b_location_1_2,
            expected_mean_pm2_5_city_a_location_2_3_4,
            expected_mean_pm2_5_city_b_location_1_2,
            expected_mean_so2_city_a_location_2_3_4,
            expected_mean_so2_city_b_location_1_2,
        ),
    ],
)
def test__response_contains_correct_pollutant_mean_aqi_level(
    test_measurement_base_time_string: str,
    expected_test_city_a_no2_mean_aqi_level: float,
    expected_test_city_b_no2_mean_aqi_level: float,
    expected_test_city_a_o3_mean_aqi_level: float,
    expected_test_city_b_o3_mean_aqi_level: float,
    expected_test_city_a_pm10_mean_aqi_level: float,
    expected_test_city_b_pm10_mean_aqi_level: float,
    expected_test_city_a_pm2_5_mean_aqi_level: float,
    expected_test_city_b_pm2_5_mean_aqi_level: float,
    expected_test_city_a_so2_mean_aqi_level: float,
    expected_test_city_b_so2_mean_aqi_level: float,
):
    load_dotenv(".env-qa")

    api_parameters = (
        {
            "location_type": location_type,
            "measurement_base_time": test_measurement_base_time_string,
            "measurement_time_range": measurement_time_range,
        },
    )
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
