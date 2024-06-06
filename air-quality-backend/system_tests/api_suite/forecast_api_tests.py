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
forecast_base_time = format_datetime_as_string(
    datetime.datetime(2024, 6, 6, 0, 0),
    "%Y-%m-%dT%H:%M:%S.000+00:00",
)
valid_date_from = forecast_base_time
valid_date_to = format_datetime_as_string(
    datetime.datetime(2024, 6, 11, 0, 0), "%Y-%m-%dT%H:%M:%S.000+00:00"
)

validation_error_status_code = 422

required_and_optional_parameter_combinations = [
    (
        forecast_base_time,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
        200,
    ),
    (
        forecast_base_time,
        valid_date_from,
        valid_date_to,
        location_type,
        None,
        200,
    ),
    (
        None,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
        validation_error_status_code,
    ),
    (
        None,
        valid_date_from,
        valid_date_to,
        location_type,
        None,
        validation_error_status_code,
    ),
    (
        forecast_base_time,
        None,
        valid_date_to,
        location_type,
        location_name,
        validation_error_status_code,
    ),
    (
        forecast_base_time,
        None,
        valid_date_to,
        location_type,
        None,
        validation_error_status_code,
    ),
    (
        forecast_base_time,
        valid_date_from,
        None,
        location_type,
        location_name,
        validation_error_status_code,
    ),
    (
        forecast_base_time,
        valid_date_from,
        None,
        location_type,
        None,
        validation_error_status_code,
    ),
    (
        forecast_base_time,
        valid_date_from,
        valid_date_to,
        None,
        location_name,
        validation_error_status_code,
    ),
    (
        forecast_base_time,
        valid_date_from,
        valid_date_to,
        None,
        None,
        validation_error_status_code,
    ),
]


@pytest.mark.parametrize(
    "_forecast_base_time, _valid_date_from, _valid_date_to, _location_type, _location_name, expected_status_code",
    required_and_optional_parameter_combinations,
)
def test_required_and_optional_parameter_combinations_verify_response_status_code(
    _forecast_base_time: str,
    _valid_date_from: str,
    _valid_date_to: str,
    _location_type: str,
    _location_name: str,
    expected_status_code: int,
):
    payload = {
        "forecast_base_time": _forecast_base_time,
        "valid_date_from": _valid_date_from,
        "valid_date_to": _valid_date_to,
        "location_type": _location_type,
        "location_name": _location_name,
    }
    response = requests.request("GET", base_url, headers=headers, params=payload)

    assert response.status_code == expected_status_code
