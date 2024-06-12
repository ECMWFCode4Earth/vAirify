import datetime
import pytest
import requests
from dotenv import load_dotenv

from air_quality.database.forecasts import Forecast
from system_tests.utils.api_utilities import (
    format_datetime_as_string,
    get_list_of_key_values,
    seed_api_test_data,
)
from system_tests.utils.cams_utilities import delete_database_data

# Test Data
test_city_1_input_data: Forecast = {
    "forecast_valid_time": datetime.datetime(
        2024, 6, 10, 3, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "source": "cams-production",
    "forecast_base_time": datetime.datetime(
        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "location_type": "city",
    "name": "Test City 1",
    "forecast_range": 0,
    "last_modified_time": datetime.datetime(
        2024, 6, 10, 7, 49, 53, 664, tzinfo=datetime.timezone.utc
    ),
    "location": {
        "type": "Point",
        "coordinates": [54.36667, 24.46667],
    },
    "no2": {"aqi_level": 1, "value": 7.79346375328925},
    "o3": {"aqi_level": 4, "value": 212.70172151472397},
    "overall_aqi_level": 6,
    "pm10": {"aqi_level": 6, "value": 205.640266314635},
    "pm2_5": {"aqi_level": 4, "value": 48.76003397454627},
    "so2": {"aqi_level": 1, "value": 7.58745619326088},
    "created_time": datetime.datetime(
        2024, 6, 10, 7, 49, 53, 664, tzinfo=datetime.timezone.utc
    ),
}

test_city_2_input_data: Forecast = {
    "forecast_valid_time": datetime.datetime(
        2024, 6, 12, 0, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "source": "cams-production",
    "forecast_base_time": datetime.datetime(
        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "location_type": "city",
    "name": "Test City 2",
    "forecast_range": 0,
    "last_modified_time": datetime.datetime(
        2024, 6, 10, 7, 49, 53, 664, tzinfo=datetime.timezone.utc
    ),
    "location": {
        "type": "Point",
        "coordinates": [54.36667, 24.46667],
    },
    "no2": {"aqi_level": 6, "value": 350.76859403417895},
    "o3": {"aqi_level": 5, "value": 261.70172151472397},
    "overall_aqi_level": 6,
    "pm10": {"aqi_level": 1, "value": 10.640266314635},
    "pm2_5": {"aqi_level": 1, "value": 9.76003397454627},
    "so2": {"aqi_level": 3, "value": 212.58745619326088},
    "created_time": datetime.datetime(
        2024, 6, 10, 7, 49, 53, 664, tzinfo=datetime.timezone.utc
    ),
}

test_city_3_input_data: Forecast = {
    "forecast_valid_time": datetime.datetime(
        2024, 6, 10, 15, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "source": "cams-production",
    "forecast_base_time": datetime.datetime(
        2024, 6, 11, 0, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "location_type": "city",
    "name": "Test City 3",
    "forecast_range": 0,
    "last_modified_time": datetime.datetime(
        2024, 6, 10, 7, 49, 53, 664, tzinfo=datetime.timezone.utc
    ),
    "location": {
        "type": "Point",
        "coordinates": [54.36667, 24.46667],
    },
    "no2": {"aqi_level": 4, "value": 150.79346375328925},
    "o3": {"aqi_level": 3, "value": 101.70172151472397},
    "overall_aqi_level": 4,
    "pm10": {"aqi_level": 2, "value": 30.640266314635},
    "pm2_5": {"aqi_level": 3, "value": 22.76003397454627},
    "so2": {"aqi_level": 2, "value": 103.58745619326088},
    "created_time": datetime.datetime(
        2024, 6, 10, 7, 49, 53, 664, tzinfo=datetime.timezone.utc
    ),
}

test_city_1_expected_response_data: dict = {
    "base_time": format_datetime_as_string(
        test_city_1_input_data["forecast_base_time"], "%Y-%m-%dT%H:%M:%S+00:00"
    ),
    "valid_time": format_datetime_as_string(
        test_city_1_input_data["forecast_valid_time"], "%Y-%m-%dT%H:%M:%S+00:00"
    ),
    "location_type": test_city_1_input_data["location_type"],
    "location_name": test_city_1_input_data["name"],
    "overall_aqi_level": test_city_1_input_data["overall_aqi_level"],
    "no2": test_city_1_input_data["no2"],
    "o3": test_city_1_input_data["o3"],
    "pm2_5": test_city_1_input_data["pm2_5"],
    "pm10": test_city_1_input_data["pm10"],
    "so2": test_city_1_input_data["so2"],
}

test_city_2_expected_response_data: dict = {
    "base_time": format_datetime_as_string(
        test_city_2_input_data["forecast_base_time"], "%Y-%m-%dT%H:%M:%S+00:00"
    ),
    "valid_time": format_datetime_as_string(
        test_city_2_input_data["forecast_valid_time"], "%Y-%m-%dT%H:%M:%S+00:00"
    ),
    "location_type": test_city_2_input_data["location_type"],
    "location_name": test_city_2_input_data["name"],
    "overall_aqi_level": test_city_2_input_data["overall_aqi_level"],
    "no2": test_city_2_input_data["no2"],
    "o3": test_city_2_input_data["o3"],
    "pm2_5": test_city_2_input_data["pm2_5"],
    "pm10": test_city_2_input_data["pm10"],
    "so2": test_city_2_input_data["so2"],
}

# API GET request
base_url = "http://127.0.0.1:8000/air-pollutant/forecast"
headers = {"accept": "application/json"}
location_type = "city"

base_time = datetime.datetime(2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc)
base_time_string = format_datetime_as_string(
    base_time,
    "%Y-%m-%dT%H:%M:%S+00:00",
)
valid_time_from_string = base_time_string
valid_time_to_string = format_datetime_as_string(
    datetime.datetime(2024, 6, 15, 0, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%S+00:00",
)

# Test Setup
load_dotenv(".env-qa")
delete_database_data("forecast_data")
seed_api_test_data(
    "forecast_data",
    [test_city_1_input_data, test_city_2_input_data, test_city_3_input_data],
)


# Tests
@pytest.mark.parametrize(
    "parameters, expected_cities",
    [
        (
            {
                "forecast_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_from": valid_time_from_string,
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
            },
            ["Test City 1", "Test City 2"],
        ),
        (
            {
                "forecast_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_from": valid_time_from_string,
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            ["Test City 1"],
        ),
        (
            {
                "forecast_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_from": valid_time_from_string,
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
            },
            ["Test City 3"],
        ),
    ],
)
def test__different_base_times__assert_correct_results_returned(
    parameters: dict,
    expected_cities: list,
):
    load_dotenv(".env-qa")
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )

    expected = expected_cities
    actual_cities = get_list_of_key_values(response.json(), "location_name")
    for city in actual_cities:
        index = actual_cities.index(city)
        assert city == expected[index]


@pytest.mark.parametrize(
    "parameters, expected",
    [
        (
            {
                "forecast_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 9, 12, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_from": valid_time_from_string,
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
            },
            0,
        ),
        (
            {
                "forecast_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_from": valid_time_from_string,
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
            },
            2,
        ),
        (
            {
                "forecast_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 12, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_from": valid_time_from_string,
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
            },
            0,
        ),
        (
            {
                "forecast_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 9, 12, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_from": valid_time_from_string,
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            0,
        ),
        (
            {
                "forecast_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_from": valid_time_from_string,
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            1,
        ),
        (
            {
                "forecast_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 12, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_from": valid_time_from_string,
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            0,
        ),
    ],
)
def test__base_time_bva__assert_number_of_results(parameters: dict, expected: int):
    load_dotenv(".env-qa")
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    response_json = response.json()

    assert len(response_json) == expected


@pytest.mark.parametrize(
    "parameters, expected_cities",
    [
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
            },
            ["Test City 1", "Test City 2"],
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
            },
            ["Test City 2"],
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            ["Test City 1"],
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 2",
            },
            ["Test City 2"],
        ),
    ],
)
def test__different_valid_time_from_times__assert_correct_results(
    parameters: dict,
    expected_cities: list,
):
    load_dotenv(".env-qa")
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    expected = expected_cities
    actual_cities = get_list_of_key_values(response.json(), "location_name")
    for city in actual_cities:
        index = actual_cities.index(city)
        assert city == expected[index]


@pytest.mark.parametrize(
    "parameters, expected",
    [
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
            },
            2,
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 3, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
            },
            2,
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 6, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
            },
            1,
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            1,
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 3, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            1,
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 6, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            0,
        ),
    ],
)
def test__valid_time_from_bva__assert_number_of_results(
    parameters: dict, expected: int
):
    load_dotenv(".env-qa")
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    response_json = response.json()

    assert len(response_json) == expected


@pytest.mark.parametrize(
    "parameters, expected_cities",
    [
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "location_type": location_type,
            },
            ["Test City 1"],
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "location_type": location_type,
            },
            ["Test City 1", "Test City 2"],
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "location_type": location_type,
                "location_name": "Test City 2",
            },
            [],
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "location_type": location_type,
                "location_name": "Test City 2",
            },
            ["Test City 2"],
        ),
    ],
)
def test__different_valid_time_to_times__assert_correct_results(
    parameters: dict,
    expected_cities: list,
):
    load_dotenv(".env-qa")
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    expected = expected_cities
    actual_cities = get_list_of_key_values(response.json(), "location_name")
    for city in actual_cities:
        index = actual_cities.index(city)
        assert city == expected[index]


@pytest.mark.parametrize(
    "parameters, expected",
    [
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 12, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "location_type": location_type,
            },
            1,
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "location_type": location_type,
            },
            2,
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 12, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "location_type": location_type,
            },
            2,
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 12, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            1,
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            1,
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "location_type": location_type,
                "location_name": "Test City 2",
            },
            1,
        ),
    ],
)
def test__valid_time_to_bva__assert_number_of_results(parameters: dict, expected: int):
    load_dotenv(".env-qa")
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    response_json = response.json()

    assert len(response_json) == expected


@pytest.mark.parametrize(
    "parameters",
    (
        {
            "forecast_base_time": base_time_string,
            "valid_date_from": valid_time_from_string,
            "valid_date_to": valid_time_to_string,
            "location_type": location_type,
        },
        {
            "forecast_base_time": base_time_string,
            "valid_date_from": valid_time_from_string,
            "valid_date_to": valid_time_to_string,
            "location_type": location_type,
            "location_name": "Test City 1",
        },
    ),
)
def test__results_containing_relevant_base_time(parameters: dict):
    load_dotenv(".env-qa")
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    response_json = response.json()
    for forecast in response_json:
        assert forecast["base_time"] == base_time_string


@pytest.mark.parametrize(
    "parameters, expected_response",
    [
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
            },
            [
                test_city_1_expected_response_data,
                test_city_2_expected_response_data,
            ],
        ),
        (
            {
                "forecast_base_time": base_time_string,
                "valid_date_from": valid_time_from_string,
                "valid_date_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 2",
            },
            [
                test_city_2_expected_response_data,
            ],
        ),
    ],
)
def test__assert_response_keys_and_values_are_correct(
    parameters: dict, expected_response: list
):
    load_dotenv(".env-qa")
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    response_json = response.json()
    assert response_json == expected_response
