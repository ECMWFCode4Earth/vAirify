import datetime
import random
import pytest
import requests
from system_tests.utils.api_utilities import (
    format_datetime_as_string,
)
from system_tests.data.cities_data import all_cities
from system_tests.utils.routes import Routes

base_url = Routes.forecast_api_endpoint
headers = {"accept": "application/json"}
location_type = "city"
location_name = random.choice(all_cities)
base_time = datetime.datetime(2024, 6, 10, 0, 0, tzinfo=datetime.timezone.utc)
base_time_string = format_datetime_as_string(
    base_time,
    "%Y-%m-%dT%H:%M:%S+00:00",
)
valid_time_from_string = base_time_string
valid_time_to_string = format_datetime_as_string(
    datetime.datetime(2024, 6, 15, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%S+00:00",
)


@pytest.mark.parametrize(
    "payload",
    [
        {
            "base_time": base_time_string,
            "valid_time_from": valid_time_from_string,
            "valid_time_to": valid_time_to_string,
            "location_type": location_type,
            "location_name": location_name,
        },
        {
            "base_time": base_time_string,
            "valid_time_from": valid_time_from_string,
            "valid_time_to": valid_time_to_string,
            "location_type": location_type,
        },
    ],
)
def test__required_parameters_provided__verify_response_status_200(payload: dict):
    response = requests.request(
        "GET", base_url, headers=headers, params=payload, timeout=5.0
    )
    assert response.status_code == 200


@pytest.mark.parametrize(
    "payload",
    [
        {
            "valid_time_from": valid_time_from_string,
            "valid_time_to": valid_time_to_string,
            "location_type": location_type,
            "location_name": location_name,
        },
        {
            "valid_time_from": valid_time_from_string,
            "valid_time_to": valid_time_to_string,
            "location_type": location_type,
        },
        {
            "base_time": base_time_string,
            "valid_time_to": valid_time_to_string,
            "location_type": location_type,
            "location_name": location_name,
        },
        {
            "base_time": base_time_string,
            "valid_time_to": valid_time_to_string,
            "location_type": location_type,
        },
        {
            "base_time": base_time_string,
            "valid_time_from": valid_time_from_string,
            "location_type": location_type,
            "location_name": location_name,
        },
        {
            "base_time": base_time_string,
            "valid_time_from": valid_time_from_string,
            "location_type": location_type,
        },
        {
            "base_time": base_time_string,
            "valid_time_from": valid_time_from_string,
            "valid_time_to": valid_time_to_string,
            "location_name": location_name,
        },
        {
            "base_time": base_time_string,
            "valid_time_from": valid_time_from_string,
            "valid_time_to": valid_time_to_string,
        },
        {
            "location_name": location_name,
        },
        {},
    ],
)
def test__required_and_optional_parameter_combinations_missing__verify_status_422(
    payload: dict,
):
    response = requests.request(
        "GET", base_url, headers=headers, params=payload, timeout=5.0
    )
    assert response.status_code == 422


@pytest.mark.parametrize(
    "payload, method",
    [
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": location_name,
            },
            "POST",
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": location_name,
            },
            "PUT",
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": location_name,
            },
            "PATCH",
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
                "location_name": location_name,
            },
            "DELETE",
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            "POST",
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            "PUT",
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            "PATCH",
        ),
        (
            {
                "base_time": base_time_string,
                "valid_time_from": valid_time_from_string,
                "valid_time_to": valid_time_to_string,
                "location_type": location_type,
            },
            "DELETE",
        ),
    ],
)
def test__different_http_request_methods__verify_not_valid(method: str, payload: dict):
    response = requests.request(method, base_url, params=payload, timeout=5.0)

    assert response.status_code == 405
    assert not isinstance(response.json(), list)
