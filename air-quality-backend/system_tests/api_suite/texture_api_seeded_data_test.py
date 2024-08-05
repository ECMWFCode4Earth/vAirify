import datetime
import statistics
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
    assert response.json() == [{'base_time': '2024-08-04T12:00:00Z',
                                'chunk': '1 of 3',
                                'max_value': 7.0,
                                'min_value': 1.0,
                                'source': 'cams-production',
                                'texture_uri': '/root/aqi_2024-08-04_12_CAMS_global.chunk_1_of_3.webp',
                                'time_end': '2024-08-06T09:00:00Z',
                                'time_start': '2024-08-04T12:00:00Z',
                                'variable': 'aqi'},
                               {'base_time': '2024-08-04T12:00:00Z',
                                'chunk': '2 of 3',
                                'max_value': 7.0,
                                'min_value': 1.0,
                                'source': 'cams-production',
                                'texture_uri': '/root/aqi_2024-08-04_12_CAMS_global.chunk_2_of_3.webp',
                                'time_end': '2024-08-08T09:00:00Z',
                                'time_start': '2024-08-06T12:00:00Z',
                                'variable': 'aqi'},
                               {'base_time': '2024-08-04T12:00:00Z',
                                'chunk': '3 of 3',
                                'max_value': 7.0,
                                'min_value': 1.0,
                                'source': 'cams-production',
                                'texture_uri': '/root/aqi_2024-08-04_12_CAMS_global.chunk_3_of_3.webp',
                                'time_end': '2024-08-09T12:00:00Z',
                                'time_start': '2024-08-08T12:00:00Z',
                                'variable': 'aqi'},
                               ]