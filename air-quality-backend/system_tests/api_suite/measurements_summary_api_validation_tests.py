import datetime

import pytest
import requests

from system_tests.utils.api_utilities import format_datetime_as_string
from system_tests.utils.routes import Routes

base_url = Routes.measurement_summary_api_url
location_type = "city"
measurement_base_time_string_24_7_20_14_0_0 = format_datetime_as_string(
    datetime.datetime(2024, 7, 20, 14, 0, 0, tzinfo=datetime.timezone.utc),
    "%Y-%m-%dT%H:%M:%S+00:00",
)
measurement_time_range = 90


def test__required_parameters_provided__verify_response_status_200():

    payload: dict = {
        "location_type": location_type,
        "measurement_base_time": measurement_base_time_string_24_7_20_14_0_0,
        "measurement_time_range": measurement_time_range,
    }
    response = requests.request("GET", base_url, params=payload, timeout=5.0)
    assert response.status_code == 200


@pytest.mark.parametrize(
    "payload",
    [
        {
            "location_type": "",
            "measurement_base_time": measurement_base_time_string_24_7_20_14_0_0,
            "measurement_time_range": measurement_time_range,
        },
        {
            "location_type": location_type,
            "measurement_base_time": "",
            "measurement_time_range": measurement_time_range,
        },
        {
            "location_type": location_type,
            "measurement_base_time": measurement_base_time_string_24_7_20_14_0_0,
            "measurement_time_range": "",
        },
        {
            "location_type": "",
            "measurement_base_time": "",
            "measurement_time_range": "",
        },
        {
            "measurement_base_time": measurement_base_time_string_24_7_20_14_0_0,
            "measurement_time_range": measurement_time_range,
        },
        {
            "location_type": location_type,
            "measurement_time_range": measurement_time_range,
        },
        {
            "location_type": location_type,
            "measurement_base_time": measurement_base_time_string_24_7_20_14_0_0,
        },
        {},
    ],
)
def test__required_parameters_missing_or_empty__verify_response_status_422(
    payload: dict,
):
    response = requests.request("GET", base_url, params=payload, timeout=5.0)

    assert response.status_code == 422
