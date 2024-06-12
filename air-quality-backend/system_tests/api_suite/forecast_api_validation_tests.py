import datetime
import random
import pytest
import requests
from system_tests.utils.api_utilities import (
    format_datetime_as_string,
)
from system_tests.utils.cities_data import all_cities

base_url = "http://127.0.0.1:8000/air-pollutant/forecast"
headers = {"accept": "application/json"}
location_type = "city"
location_name = random.choice(all_cities)
base_time = datetime.datetime(2024, 6, 10, 0, 0)
base_time_string = format_datetime_as_string(
    base_time,
    "%Y-%m-%dT%H:%M:%S+00:00",
)
valid_time_from_string = base_time_string
valid_time_to_string = format_datetime_as_string(
    datetime.datetime(2024, 6, 15, 0, 0), "%Y-%m-%dT%H:%M:%S+00:00"
)

success_status_code = 200
validation_error_status_code = 422


@pytest.mark.parametrize(
    "payload, expected_status_code",
    [
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": location_name,
            },
            success_status_code,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            success_status_code,
        ),
        (
            {
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": location_name,
            },
            validation_error_status_code,
        ),
        (
            {
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            validation_error_status_code,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": location_name,
            },
            validation_error_status_code,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            validation_error_status_code,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "location_type": location_type,
                "location_name": location_name,
            },
            validation_error_status_code,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "location_type": location_type,
            },
            validation_error_status_code,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_name": location_name,
            },
            validation_error_status_code,
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
            },
            validation_error_status_code,
        ),
        (
            {
                "location_name": location_name,
            },
            validation_error_status_code,
        ),
        (
            {},
            validation_error_status_code,
        ),
    ],
)
def test__required_and_optional_parameter_combinations__verify_response_status_code(
    payload: dict,
    expected_status_code: int,
):
    response = requests.request(
        "GET", base_url, headers=headers, params=payload, timeout=5.0
    )
    assert response.status_code == expected_status_code
