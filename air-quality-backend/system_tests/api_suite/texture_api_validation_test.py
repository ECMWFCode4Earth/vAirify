import datetime
import pytest
import requests
from dotenv import load_dotenv
from system_tests.utils.database_utilities import (
    seed_api_test_data,
    delete_database_data,
)
from system_tests.utils.routes import Routes

base_url = Routes.texture_api_endpoint
headers = {"accept": "application/json"}


@pytest.fixture()
def setup_test():
    # Test Setup
    load_dotenv()
    delete_database_data("data_textures")
    seed_api_test_data(
        "data_textures",
        [{
            "source": "cams-production",
            "forecast_base_time": datetime.datetime(2024, 8, 4, 12, 00, 00, 00, tzinfo=datetime.timezone.utc),
            "variable": "aqi",
            "time_end": "2024-08-06T09:00:00.000Z",
            "time_start": "2024-08-04T12:00:00.000Z",
            "chunk": "1 of 3",
            "last_modified_time": "2024-08-05T09:19:52.351Z",
            "max_value": 7,
            "min_value": 1,
            "texture_uri": "root/aqi_2024-08-04_12_CAMS_global.chunk_1_of_3.webp",
            "units": "fractional overall AQI",
            "created_time": "2024-08-05T09:19:52.351Z"
        },
            {
                "source": "cams-production",
                "forecast_base_time": datetime.datetime(2024, 8, 4, 12, 00, 00, 00, tzinfo=datetime.timezone.utc),
                "variable": "aqi",
                "time_end": "2024-08-08T09:00:00.000Z",
                "time_start": "2024-08-06T12:00:00.000Z",
                "chunk": "2 of 3",
                "last_modified_time": "2024-08-05T09:19:52.351Z",
                "max_value": 7,
                "min_value": 1,
                "texture_uri": "root/aqi_2024-08-04_12_CAMS_global.chunk_2_of_3.webp",
                "units": "fractional overall AQI",
                "created_time": "2024-08-05T09:19:52.351Z"
            },
            {
                "source": "cams-production",
                "forecast_base_time": datetime.datetime(2024, 8, 4, 12, 00, 00, 00, tzinfo=datetime.timezone.utc),
                "variable": "aqi",
                "time_end": "2024-08-09T12:00:00.000Z",
                "time_start": "2024-08-08T12:00:00.000Z",
                "chunk": "3 of 3",
                "last_modified_time": "2024-08-05T09:19:52.351Z",
                "max_value": 7,
                "min_value": 1,
                "texture_uri": "root/aqi_2024-08-04_12_CAMS_global.chunk_3_of_3.webp",
                "units": "fractional overall AQI",
                "created_time": "2024-08-05T09:19:52.351Z"
            },
            {
                "source": "cams-production",
                "forecast_base_time": datetime.datetime(2024, 8, 5, 12, 00, 00, 00, tzinfo=datetime.timezone.utc),
                "variable": True,
            }
        ]
    )


def test__required_parameters_provided__verify_response_status_200_and_data_returned(setup_test):
    response = requests.request(
        "GET", base_url, headers=headers, params={"base_time": "2024-08-04T12:00:00.000Z"}, timeout=5.0
    )
    assert response.status_code == 200


@pytest.mark.parametrize(
    "api_parameters",
    [
        (
                {"base_time": ""}
        ),
        (
                {"base_time": " "}
        ),
        (
                {"": ""}
        ),
        (
                {"base_time": "2024-08-04T13:00:00.000Z "}
        ),
        (
                {"base_time": " 2024-08-04T13:00:00.000Z"}
        ),
        (
                {"base_time": "2024-08-0413:00:00.000Z"}
        ),
        (
                {"base_time": "2024-0804T13:00:00.000Z"}
        ),
        (
                {"": "2024-08-04T13:00:00.000Z"}
        ),
    ],
)
def test__incorrect_dates__verify_response_status_404(setup_test, api_parameters: dict):
    response = requests.request(
        "GET", base_url, headers=headers, params=api_parameters, timeout=5.0
    )
    assert response.status_code == 422


@pytest.mark.parametrize(
    "api_parameters",
    [
        (
                {"base_time": "2024-08-07T12:00:00.000Z"}
        ),
        (
                {"base_time": "2024-08-07T00:00:00.000Z"}
        ),
        (
                {"base_time": "2024-08-04T00:10:00.000Z"}
        ),
        (
                {"base_time": "2024-08-04T00:00:10.000Z"}
        ),
        (
                {"base_time": "2024-08-04T00:00:00.010Z"}
        ),
        (
                {"base_time": "2024-08-04"}
        ),
    ],
)
def test__correct_dates_no_data__verify_response_status_404(setup_test, api_parameters):
    response = requests.request(
        "GET", base_url, headers=headers, params=api_parameters, timeout=5.0
    )
    assert response.status_code == 404


def test__invalid_data_in_database__verify_response_status_500(setup_test):
    response = requests.request(
        "GET", base_url, headers=headers, params={"base_time": "2024-08-05T12:00:00Z"}, timeout=5.0
    )
    assert response.status_code == 500
