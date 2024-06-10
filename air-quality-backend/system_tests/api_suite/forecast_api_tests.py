import datetime
import random
import pytest
import requests
from dotenv import load_dotenv

from air_quality.database.forecasts import Forecast
from system_tests.utils.api_utilities import (
    format_datetime_as_string,
    create_forecast_api_parameters_payload,
    get_expected_valid_times_list,
    get_list_of_keys,
    seed_api_test_data,
    get_forecast,
)
from system_tests.utils.cams_utilities import delete_database_data
from system_tests.utils.cities_data import all_cities

base_url = "http://127.0.0.1:8000/air-pollutant/forecast"
headers = {"accept": "application/json"}

location_type = "city"
location_name = random.choice(all_cities)
forecast_base_time = datetime.datetime(2024, 6, 10, 0, 0)
forecast_base_time_string = format_datetime_as_string(
    forecast_base_time,
    "%Y-%m-%dT%H:%M:%S+00:00",
)
valid_date_from = forecast_base_time_string
valid_date_to = format_datetime_as_string(
    datetime.datetime(2024, 6, 15, 0, 0), "%Y-%m-%dT%H:%M:%S+00:00"
)

success_status_code = 200
validation_error_status_code = 422

parameters_and_expected_status_codes_list = [
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string,
            valid_date_from,
            valid_date_to,
            location_type,
            location_name,
        ),
        success_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string, valid_date_from, valid_date_to, location_type, ""
        ),
        success_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            "", valid_date_from, valid_date_to, location_type, location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            "", valid_date_from, valid_date_to, location_type, ""
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string, "", valid_date_to, location_type, location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string, "", valid_date_to, location_type, ""
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string, valid_date_from, "", location_type, location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string, valid_date_from, "", location_type, ""
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string, valid_date_from, valid_date_to, "", location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string, valid_date_from, valid_date_to, "", ""
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload("", "", "", "", location_name),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload("", "", "", "", ""),
        validation_error_status_code,
    ),
]


@pytest.mark.parametrize(
    "payload, expected_status_code",
    parameters_and_expected_status_codes_list,
)
def test__required_and_optional_parameter_combinations__verify_response_status_code(
    payload: dict,
    expected_status_code: int,
):
    response = requests.request(
        "GET", base_url, headers=headers, params=payload, timeout=5.0
    )
    assert response.status_code == expected_status_code


def test__location_name_parameter__returns_41_results():
    response = get_forecast(
        forecast_base_time_string,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
        base_url,
        headers,
    )

    response_json = response.json()
    assert len(response_json) == 41


def test__location_name_parameter__returns_results_containing_correct_location_name():
    response = get_forecast(
        forecast_base_time_string,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
        base_url,
        headers,
    )
    response_json = response.json()
    for forecast in response_json:
        assert forecast["location_name"] == location_name


def test__location_name_parameter__returns_results_containing_correct_base_time():
    response = get_forecast(
        forecast_base_time_string,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
        base_url,
        headers,
    )
    response_json = response.json()
    for forecast in response_json:
        assert forecast["base_time"] == forecast_base_time_string


def test__location_name_parameter__returns_results_containing_correct_valid_times():
    response = get_forecast(
        forecast_base_time_string,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
        base_url,
        headers,
    )
    response_json = response.json()
    expected_valid_time_list = get_expected_valid_times_list(forecast_base_time, 3)
    actual_valid_time_list = get_list_of_keys(response_json, "valid_date")

    assert expected_valid_time_list == actual_valid_time_list


def test__verify__parameters__work():
    load_dotenv(".env-qa")
    delete_database_data("forecast_data")

    test_forecast_base_time = datetime.datetime(2024, 6, 9, 12, 0, 0)

    forecast: Forecast = {
        "forecast_valid_time": datetime.datetime(2024, 6, 9, 12, 0, 0),
        "source": "cams-production",
        "forecast_base_time": test_forecast_base_time,
        "location_type": "city",
        "name": "Test City 1",
        "forecast_range": 0,
        "last_modified_time": datetime.datetime(2024, 6, 10, 7, 49, 53, 664),
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
        "created_time": datetime.datetime(2024, 6, 10, 7, 49, 53, 664),
    }

    seed_api_test_data("forecast_data", [forecast])
    get_forecast(
        forecast_base_time_string,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
        base_url,
        headers,
    )
