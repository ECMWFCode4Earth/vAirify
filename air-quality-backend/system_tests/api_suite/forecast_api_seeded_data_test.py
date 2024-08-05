import datetime
import pytest
import requests
from dotenv import load_dotenv

from system_tests.data.forecast_api_test_data import (
    create_forecast_database_data_with_overrides,
    create_forecast_api_database_data_pollutant_value,
)
from system_tests.data.measurement_summary_api_test_data import create_location_values
from system_tests.utils.api_utilities import (
    format_datetime_as_string,
    get_list_of_key_values,
)
from system_tests.utils.database_utilities import (
    seed_api_test_data,
    delete_database_data,
)
from system_tests.utils.routes import Routes

# Test Data

test_city_1_input_data: dict = create_forecast_database_data_with_overrides(
    {
        "forecast_valid_time": datetime.datetime(
            2024, 6, 10, 3, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "forecast_base_time": datetime.datetime(
            2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 1",
        "location": create_location_values("point", [2, 3]),
        "no2": create_forecast_api_database_data_pollutant_value(1, 7.79346375328925),
        "o3": create_forecast_api_database_data_pollutant_value(4, 212.70172151472397),
        "overall_aqi_level": 6,
        "pm10": create_forecast_api_database_data_pollutant_value(6, 205.640266314635),
        "pm2_5": create_forecast_api_database_data_pollutant_value(
            4, 48.76003397454627
        ),
        "so2": create_forecast_api_database_data_pollutant_value(1, 7.58745619326088),
    }
)

test_city_2_input_data: dict = create_forecast_database_data_with_overrides(
    {
        "forecast_valid_time": datetime.datetime(
            2024, 6, 12, 0, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "forecast_base_time": datetime.datetime(
            2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 2",
        "location": create_location_values("point", [50, -70]),
        "no2": create_forecast_api_database_data_pollutant_value(6, 350.76859403417895),
        "o3": create_forecast_api_database_data_pollutant_value(5, 261.70172151472397),
        "overall_aqi_level": 6,
        "pm10": create_forecast_api_database_data_pollutant_value(1, 10.640266314635),
        "pm2_5": create_forecast_api_database_data_pollutant_value(1, 9.76003397454627),
        "so2": create_forecast_api_database_data_pollutant_value(3, 212.58745619326088),
    }
)

test_city_3_input_data: dict = create_forecast_database_data_with_overrides(
    {
        "forecast_valid_time": datetime.datetime(
            2024, 6, 10, 15, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "forecast_base_time": datetime.datetime(
            2024, 6, 11, 0, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 3",
        "location": create_location_values("point", [100, 100]),
        "no2": create_forecast_api_database_data_pollutant_value(4, 150.79346375328925),
        "o3": create_forecast_api_database_data_pollutant_value(3, 101.70172151472397),
        "overall_aqi_level": 4,
        "pm10": create_forecast_api_database_data_pollutant_value(2, 30.640266314635),
        "pm2_5": create_forecast_api_database_data_pollutant_value(
            3, 22.76003397454627
        ),
        "so2": create_forecast_api_database_data_pollutant_value(2, 103.58745619326088),
    }
)

test_city_1_expected_response_data: dict = {
    "base_time": format_datetime_as_string(
        test_city_1_input_data["forecast_base_time"], "%Y-%m-%dT%H:%M:%SZ"
    ),
    "location": {
        "latitude": test_city_1_input_data["location"]["coordinates"][1],
        "longitude": test_city_1_input_data["location"]["coordinates"][0],
    },
    "valid_time": format_datetime_as_string(
        test_city_1_input_data["forecast_valid_time"], "%Y-%m-%dT%H:%M:%SZ"
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
        test_city_2_input_data["forecast_base_time"], "%Y-%m-%dT%H:%M:%SZ"
    ),
    "location": {
        "latitude": test_city_2_input_data["location"]["coordinates"][1],
        "longitude": test_city_2_input_data["location"]["coordinates"][0],
    },
    "valid_time": format_datetime_as_string(
        test_city_2_input_data["forecast_valid_time"], "%Y-%m-%dT%H:%M:%SZ"
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

invalid_forecast_document: dict = {
    "forecast_valid_time": datetime.datetime(
        2024, 3, 27, 9, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "source": datetime.datetime(2024, 6, 10, 3, 0, 0, tzinfo=datetime.timezone.utc),
    "forecast_base_time": datetime.datetime(
        2024, 3, 27, 0, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "location_type": "city",
    "name": 3.4,
    "forecast_range": "",
    "last_modified_time": "2024/01/06",
    "location": create_location_values("point", [54.433746, 24.424399]),
    "no2": create_forecast_api_database_data_pollutant_value("1", "7.79346375328925"),
    "overall_aqi_level": None,
    "pm10": create_forecast_api_database_data_pollutant_value(6, 883750432785972),
    "pm2_5": create_forecast_api_database_data_pollutant_value(-4, -48.76003397454627),
    "so2": create_forecast_api_database_data_pollutant_value(
        1, datetime.datetime(2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc)
    ),
    "created_time": 5.7,
}

# API GET request
base_url = Routes.forecast_api_endpoint
headers = {"accept": "application/json"}
location_type = "city"

base_time = datetime.datetime(2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc)
base_time_string = format_datetime_as_string(
    base_time,
    "%Y-%m-%dT%H:%M:%SZ",
)
valid_time_from_string = base_time_string
valid_time_to_string = format_datetime_as_string(
    datetime.datetime(2024, 6, 15, 0, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%S+00:00",
)


@pytest.fixture
def setup_test():
    load_dotenv()
    delete_database_data("forecast_data")
    seed_api_test_data(
        "forecast_data",
        [
            test_city_1_input_data,
            test_city_2_input_data,
            test_city_3_input_data,
            invalid_forecast_document,
        ],
    )


# Tests
@pytest.mark.parametrize(
    "parameters, expected_cities",
    [
        (
            {
                "base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            ["Test City 1", "Test City 2"],
        ),
        (
            {
                "base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            ["Test City 1"],
        ),
        (
            {
                "base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            ["Test City 3"],
        ),
    ],
)
def test__different_base_times__assert_correct_results_returned(
    setup_test,
    parameters: dict,
    expected_cities: list,
):
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    actual_cities = get_list_of_key_values(response.json(), "location_name")

    assert actual_cities == expected_cities


@pytest.mark.parametrize(
    "parameters, expected",
    [
        (
            {
                "base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 9, 12, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            0,
        ),
        (
            {
                "base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            2,
        ),
        (
            {
                "base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 12, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            0,
        ),
        (
            {
                "base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 9, 12, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            0,
        ),
        (
            {
                "base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            1,
        ),
        (
            {
                "base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 12, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            0,
        ),
    ],
)
def test__base_time_bva__assert_number_of_results(
    setup_test, parameters: dict, expected: int
):
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
                "base_time": base_time_string,
                "valid_time_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            ["Test City 1", "Test City 2"],
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            ["Test City 2"],
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            ["Test City 1"],
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 2",
            },
            ["Test City 2"],
        ),
    ],
)
def test__different_valid_time_from_times__assert_correct_results(
    setup_test,
    parameters: dict,
    expected_cities: list,
):
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    actual_cities = get_list_of_key_values(response.json(), "location_name")

    assert actual_cities == expected_cities


@pytest.mark.parametrize(
    "parameters, expected",
    [
        (
            {
                "base_time": base_time_string,
                "valid_time_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            2,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 3, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            2,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 6, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            1,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            1,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 3, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            1,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 6, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": "Test City 1",
            },
            0,
        ),
    ],
)
def test__valid_time_from_bva__assert_number_of_results(
    setup_test, parameters: dict, expected: int
):
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
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": format_datetime_as_string(
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
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": format_datetime_as_string(
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
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": format_datetime_as_string(
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
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": format_datetime_as_string(
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
    setup_test,
    parameters: dict,
    expected_cities: list,
):
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    actual_cities = get_list_of_key_values(response.json(), "location_name")

    assert actual_cities == expected_cities


@pytest.mark.parametrize(
    "parameters, expected",
    [
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": format_datetime_as_string(
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
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": format_datetime_as_string(
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
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": format_datetime_as_string(
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
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": format_datetime_as_string(
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
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": format_datetime_as_string(
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
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": format_datetime_as_string(
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
def test__valid_time_to_bva__assert_number_of_results(
    setup_test, parameters: dict, expected: int
):
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    response_json = response.json()

    assert len(response_json) == expected


@pytest.mark.parametrize(
    "parameters",
    (
        {
            "base_time": base_time_string,
            "valid_time_from": valid_time_from_string,
            "valid_time_to": valid_time_to_string,
            "location_type": location_type,
        },
        {
            "base_time": base_time_string,
            "valid_time_from": valid_time_from_string,
            "valid_time_to": valid_time_to_string,
            "location_type": location_type,
            "location_name": "Test City 1",
        },
    ),
)
def test__results_containing_relevant_base_time(setup_test, parameters: dict):
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
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            [
                test_city_1_expected_response_data,
                test_city_2_expected_response_data,
            ],
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
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
    setup_test, parameters: dict, expected_response: list
):
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    response_json = response.json()
    assert response_json == expected_response


def test__invalid_document_in_database__assert_500():
    parameters: dict = {
        "base_time": format_datetime_as_string(
            datetime.datetime(2024, 3, 27, 0, 0, 0, tzinfo=datetime.timezone.utc),
            "%Y-%m-%dT%H:%M:%SZ",
        ),
        "valid_time_from": format_datetime_as_string(
            datetime.datetime(2024, 3, 27, 0, 0, 0, tzinfo=datetime.timezone.utc),
            "%Y-%m-%dT%H:%M:%SZ",
        ),
        "valid_time_to": format_datetime_as_string(
            datetime.datetime(2024, 4, 1, 0, 0, 0, tzinfo=datetime.timezone.utc),
            "%Y-%m-%dT%H:%M:%SZ",
        ),
        "location_type": location_type,
    }
    response = requests.request(
        "GET", base_url, headers=headers, params=parameters, timeout=5.0
    )
    assert response.status_code == 500
