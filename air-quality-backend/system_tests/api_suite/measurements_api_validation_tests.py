import datetime
import pytest
import requests
import random

from system_tests.data.cities_data import all_cities
from system_tests.utils.api_utilities import format_datetime_as_string
from system_tests.utils.routes import Routes

base_url = Routes.measurements_api_endpoint
date_from_string_24_6_21_14_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 6, 21, 14, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%SZ",
)
date_to_string_24_6_21_16_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 6, 21, 16, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%SZ",
)
location_type = "city"
location_names = random.choice(all_cities)
api_source = "OpenAQ"


@pytest.mark.parametrize(
    "payload",
    [
        {
            "date_from": date_from_string_24_6_21_14_0_0,
            "date_to": date_to_string_24_6_21_16_0_0,
            "location_type": location_type,
            "location_names": location_names,
            "api_source": api_source,
        },
        {
            "date_from": date_from_string_24_6_21_14_0_0,
            "date_to": date_to_string_24_6_21_16_0_0,
            "location_type": location_type,
            "api_source": api_source,
        },
        {
            "date_from": date_from_string_24_6_21_14_0_0,
            "date_to": date_to_string_24_6_21_16_0_0,
            "location_type": location_type,
            "location_names": location_names,
        },
        {
            "date_from": date_from_string_24_6_21_14_0_0,
            "date_to": date_to_string_24_6_21_16_0_0,
            "location_type": location_type,
        },
    ],
)
def test__required_and_optional_parameters_provided__verify_response_status_200(
    payload: dict,
):
    response = requests.request("GET", base_url, params=payload, timeout=5.0)
    assert response.status_code == 200


@pytest.mark.parametrize(
    "payload",
    [
        {
            "date_from": "",
            "date_to": date_to_string_24_6_21_16_0_0,
            "location_type": location_type,
        },
        {
            "date_from": date_from_string_24_6_21_14_0_0,
            "date_to": "",
            "location_type": location_type,
        },
        {
            "date_from": date_from_string_24_6_21_14_0_0,
            "date_to": date_to_string_24_6_21_16_0_0,
            "location_type": "",
        },
        {
            "date_from": "",
            "date_to": "",
            "location_type": "",
        },
        {
            "date_to": date_to_string_24_6_21_16_0_0,
            "location_type": location_type,
        },
        {
            "date_from": date_from_string_24_6_21_14_0_0,
            "location_type": location_type,
        },
        {
            "date_from": date_from_string_24_6_21_14_0_0,
            "date_to": date_to_string_24_6_21_16_0_0,
        },
        {},
    ],
)
def test__required_parameters_missing_or_empty__verify_response_status_422(
    payload: dict,
):
    response = requests.request("GET", base_url, params=payload, timeout=5.0)

    assert response.status_code == 422
