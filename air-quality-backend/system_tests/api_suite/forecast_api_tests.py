import datetime
import pprint
import random

import pytest
import requests

from system_tests.utils.api_utilities import (
    format_datetime_as_string,
    create_forecast_api_parameters_payload,
)
from system_tests.utils.cities_data import all_cities

base_url = "http://127.0.0.1:8000/air-pollutant/forecast"
headers = {"accept": "application/json"}

location_type = "city"
location_name = random.choice(all_cities)
forecast_base_time = format_datetime_as_string(
    datetime.datetime(2024, 6, 6, 0, 0),
    "%Y-%m-%dT%H:%M:%S+00:00",
)
valid_date_from = forecast_base_time
valid_date_to = format_datetime_as_string(
    datetime.datetime(2024, 6, 11, 0, 0), "%Y-%m-%dT%H:%M:%S+00:00"
)

success_status_code = 200
validation_error_status_code = 422

parameters_and_expected_status_codes_list = [
    (
        create_forecast_api_parameters_payload(
            forecast_base_time,
            valid_date_from,
            valid_date_to,
            location_type,
            location_name,
        ),
        success_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time, valid_date_from, valid_date_to, location_type, ""
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
            forecast_base_time, "", valid_date_to, location_type, location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time, "", valid_date_to, location_type, ""
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time, valid_date_from, "", location_type, location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time, valid_date_from, "", location_type, ""
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time, valid_date_from, valid_date_to, "", location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time, valid_date_from, valid_date_to, "", ""
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
    payload = create_forecast_api_parameters_payload(
        forecast_base_time, valid_date_from, valid_date_to, location_type, location_name
    )
    response = requests.request(
        "GET", base_url, headers=headers, params=payload, timeout=5.0
    )
    response_json = response.json()
    assert len(response_json) == 41


def test__location_name_parameter__returns_results_containing_correct_location_name():
    payload = create_forecast_api_parameters_payload(
        forecast_base_time, valid_date_from, valid_date_to, location_type, location_name
    )
    response = requests.request(
        "GET", base_url, headers=headers, params=payload, timeout=5.0
    )
    response_json = response.json()
    for forecast in response_json:
        assert forecast["location_name"] == location_name


def test__location_name_parameter__returns_results_containing_correct_forecast_base_time():
    payload = create_forecast_api_parameters_payload(
        forecast_base_time,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
    )
    response = requests.request(
        "GET", base_url, headers=headers, params=payload, timeout=5.0
    )
    response_json = response.json()
    for forecast in response_json:
        assert forecast["base_time"] == forecast_base_time
