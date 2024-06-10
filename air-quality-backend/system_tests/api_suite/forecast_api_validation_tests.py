import datetime
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
            forecast_base_time_string,
            valid_date_from,
            valid_date_to,
            location_type,
            "",
        ),
        success_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            "",
            valid_date_from,
            valid_date_to,
            location_type,
            location_name,
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            "",
            valid_date_from,
            valid_date_to,
            location_type,
            "",
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string,
            "",
            valid_date_to,
            location_type,
            location_name,
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string,
            "",
            valid_date_to,
            location_type,
            "",
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string,
            valid_date_from,
            "",
            location_type,
            location_name,
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string,
            valid_date_from,
            "",
            location_type,
            "",
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string,
            valid_date_from,
            valid_date_to,
            "",
            location_name,
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time_string,
            valid_date_from,
            valid_date_to,
            "",
            "",
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
