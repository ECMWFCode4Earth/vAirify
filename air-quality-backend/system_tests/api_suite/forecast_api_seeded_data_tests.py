import datetime

import pytest

from air_quality.database.forecasts import Forecast
from system_tests.utils.api_utilities import (
    format_datetime_as_string,
    get_expected_valid_times_list,
    get_list_of_keys,
    get_forecast,
    setup_purge_database_and_seed_with_test_data,
)

# Test Data
test_city_1_data: Forecast = {
    "forecast_valid_time": datetime.datetime(2024, 6, 10, 3, 0, 0),
    "source": "cams-production",
    "forecast_base_time": datetime.datetime(2024, 6, 10, 0, 0, 0),
    "location_type": "city",
    "name": "Test City 1",
    "forecast_range": 0,
    "last_modified_time": datetime.datetime(2024, 6, 10, 7, 49, 53, 664),
    "location": {
        "type": "Point",
        "coordinates": [54.36667, 24.46667],
    },
    "no2": {"aqi_level": 1, "value": 7.79346375328925},
    "o3": {"aqi_level": 4, "value": 212.70172151472397},
    "overall_aqi_level": 6,
    "pm10": {"aqi_level": 6, "value": 205.640266314635},
    "pm2_5": {"aqi_level": 4, "value": 48.76003397454627},
    "so2": {"aqi_level": 1, "value": 7.58745619326088},
    "created_time": datetime.datetime(2024, 6, 10, 7, 49, 53, 664),
}

test_city_2_data: Forecast = {
    "forecast_valid_time": datetime.datetime(2024, 6, 12, 0, 0, 0),
    "source": "cams-production",
    "forecast_base_time": datetime.datetime(2024, 6, 10, 0, 0, 0),
    "location_type": "city",
    "name": "Test City 2",
    "forecast_range": 0,
    "last_modified_time": datetime.datetime(2024, 6, 10, 7, 49, 53, 664),
    "location": {
        "type": "Point",
        "coordinates": [54.36667, 24.46667],
    },
    "no2": {"aqi_level": 1, "value": 7.79346375328925},
    "o3": {"aqi_level": 4, "value": 212.70172151472397},
    "overall_aqi_level": 6,
    "pm10": {"aqi_level": 6, "value": 205.640266314635},
    "pm2_5": {"aqi_level": 4, "value": 48.76003397454627},
    "so2": {"aqi_level": 1, "value": 7.58745619326088},
    "created_time": datetime.datetime(2024, 6, 10, 7, 49, 53, 664),
}

test_city_3_data: Forecast = {
    "forecast_valid_time": datetime.datetime(2024, 6, 10, 15, 0, 0),
    "source": "cams-production",
    "forecast_base_time": datetime.datetime(2024, 6, 10, 12, 0, 0),
    "location_type": "city",
    "name": "Test City 3",
    "forecast_range": 0,
    "last_modified_time": datetime.datetime(2024, 6, 10, 7, 49, 53, 664),
    "location": {
        "type": "Point",
        "coordinates": [54.36667, 24.46667],
    },
    "no2": {"aqi_level": 1, "value": 7.79346375328925},
    "o3": {"aqi_level": 4, "value": 212.70172151472397},
    "overall_aqi_level": 6,
    "pm10": {"aqi_level": 6, "value": 205.640266314635},
    "pm2_5": {"aqi_level": 4, "value": 48.76003397454627},
    "so2": {"aqi_level": 1, "value": 7.58745619326088},
    "created_time": datetime.datetime(2024, 6, 10, 7, 49, 53, 664),
}

# API GET request
base_url = "http://127.0.0.1:8000/air-pollutant/forecast"
headers = {"accept": "application/json"}
location_type = "city"

forecast_base_time = datetime.datetime(2024, 6, 10, 0, 0)
forecast_base_time_string = format_datetime_as_string(
    forecast_base_time,
    "%Y-%m-%dT%H:%M:%S+00:00",
)
valid_date_from = forecast_base_time_string
valid_date_to = format_datetime_as_string(
    datetime.datetime(2024, 6, 15, 0, 0), "%Y-%m-%dT%H:%M:%S+00:00"
)

# Test Setup
setup_purge_database_and_seed_with_test_data(
    ".env-qa", "forecast_data", [test_city_1_data, test_city_2_data, test_city_3_data]
)


@pytest.mark.parametrize("location_name, expected", [("", 2), ("Test City 1", 1)])
def test__get_results_within_date_range_on_same_base_time__assert_number_of_results(
    location_name: str, expected: int
):
    response = get_forecast(
        forecast_base_time_string,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
        base_url,
        headers,
    )

    response_json = response.json()
    assert len(response_json) == expected


def test__no_location_name__get_results_within_date_range_on_same_base_time__assert_correct_results_returned():
    response = get_forecast(
        forecast_base_time_string,
        valid_date_from,
        valid_date_to,
        location_type,
        "",
        base_url,
        headers,
    )
    expected_cities = ["Test City 1", "Test City 2"]
    actual_cities = get_list_of_keys(response.json(), "location_name")
    for city in actual_cities:
        index = actual_cities.index(city)

        assert city == expected_cities[index]


@pytest.mark.parametrize(
    "location_name, test_forecast_base_time",
    [
        ("", datetime.datetime(2024, 6, 9, 12, 0, 0)),
        ("", datetime.datetime(2024, 6, 10, 12, 0, 0)),
        ("Test City 1", datetime.datetime(2024, 6, 9, 12, 0, 0)),
        ("Test City 1", datetime.datetime(2024, 6, 10, 12, 0, 0)),
    ],
)
def test_no_matching_base_time_in_database__assert_0_results(
    location_name: str, test_forecast_base_time: datetime.datetime
):
    test_forecast_base_time = datetime.datetime(2024, 5, 4, 0, 0)
    test_base_time_string = format_datetime_as_string(
        test_forecast_base_time,
        "%Y-%m-%dT%H:%M:%S+00:00",
    )

    response = get_forecast(
        test_base_time_string,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
        base_url,
        headers,
    )

    response_json = response.json()
    assert len(response_json) == 0


@pytest.mark.parametrize("location_name", ("", "Test City 1"))
def test__valid_date_range_outside_of_database_data__assert_0_results(
    location_name: str,
):
    test_valid_date_from = datetime.datetime(2024, 8, 10, 0, 0, 0)
    test_valid_date_to = datetime.datetime(2024, 8, 15, 0, 0, 0)

    test_valid_date_from_string = format_datetime_as_string(
        test_valid_date_from, "%Y-%m-%dT%H:%M:%S+00:00"
    )
    test_valid_date_to_string = format_datetime_as_string(
        test_valid_date_to, "%Y-%m-%dT%H:%M:%S+00:00"
    )

    response = get_forecast(
        forecast_base_time_string,
        test_valid_date_from_string,
        test_valid_date_to_string,
        location_type,
        location_name,
        base_url,
        headers,
    )

    response_json = response.json()
    assert len(response_json) == 0


def test__location_name_parameter_filters_response_correctly__assert_1_result():
    response = get_forecast(
        forecast_base_time_string,
        valid_date_from,
        valid_date_to,
        location_type,
        "Test City 2",
        base_url,
        headers,
    )

    response_json = response.json()
    assert len(response_json) == 1


@pytest.mark.parametrize("location_name", ("", "Test City 1"))
def test__results_containing_relevant_base_time(
    location_name: str,
):
    response = get_forecast(
        forecast_base_time_string,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
        base_url,
        headers,
    )
    response_json = response.json()
    for forecast in response_json:
        assert forecast["base_time"] == forecast_base_time_string


# def test__location_name_parameter__returns_results_containing_correct_valid_times():
#     response = get_forecast(
#         forecast_base_time_string,
#         valid_date_from,
#         valid_date_to,
#         location_type,
#         location_name,
#         base_url,
#         headers,
#     )
#     response_json = response.json()
#     expected_valid_time_list = get_expected_valid_times_list(forecast_base_time, 3)
#     actual_valid_time_list = get_list_of_keys(response_json, "valid_date")
#
#     assert expected_valid_time_list == actual_valid_time_list


def test__verify__parameters__work():
    get_forecast(
        forecast_base_time_string,
        valid_date_from,
        valid_date_to,
        location_type,
        location_name,
        base_url,
        headers,
    )
