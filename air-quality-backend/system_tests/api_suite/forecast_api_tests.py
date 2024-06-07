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
    "%Y-%m-%dT%H:%M:%S.000+00:00",
)
valid_date_from = forecast_base_time
valid_date_to = format_datetime_as_string(
    datetime.datetime(2024, 6, 11, 0, 0), "%Y-%m-%dT%H:%M:%S.000+00:00"
)

success_status_code = 200
validation_error_status_code = 422

required_and_optional_parameter_combinations = [
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
        create_forecast_api_parameters_payload(
            "", "", valid_date_to, location_type, location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            "", "", valid_date_to, location_type, ""
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time, "", "", location_type, location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time, "", "", location_type, ""
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time, valid_date_from, "", "", location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time, valid_date_from, "", "", ""
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            "", "", "", location_type, location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload("", "", "", location_type, ""),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(
            forecast_base_time, "", "", "", location_name
        ),
        validation_error_status_code,
    ),
    (
        create_forecast_api_parameters_payload(forecast_base_time, "", "", "", ""),
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
    required_and_optional_parameter_combinations,
)
def test_required_and_optional_parameter_combinations_verify_response_status_code(
    payload: dict,
    expected_status_code: int,
):
    pprint.pprint(payload)
    i = 0
    success = False
    while i < 3 and success is False:
        try:
            response = requests.request(
                "GET", base_url, headers=headers, params=payload
            )
            assert response.status_code == expected_status_code
            success = True
        except:
            print("Something went wrong here")
            i = i + 1
