import datetime
import pprint
import pytest
from air_quality.database.forecasts import Forecast
from system_tests.utils.api_utilities import (
    format_datetime_as_string,
    get_list_of_keys,
    get_forecast,
    setup_purge_database_and_seed_with_test_data,
)

# Test Data
test_city_1_input_data: Forecast = {
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

test_city_2_input_data: Forecast = {
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
    "no2": {"aqi_level": 6, "value": 350.76859403417895},
    "o3": {"aqi_level": 5, "value": 261.70172151472397},
    "overall_aqi_level": 6,
    "pm10": {"aqi_level": 1, "value": 10.640266314635},
    "pm2_5": {"aqi_level": 1, "value": 9.76003397454627},
    "so2": {"aqi_level": 3, "value": 212.58745619326088},
    "created_time": datetime.datetime(2024, 6, 10, 7, 49, 53, 664),
}

test_city_3_input_data: Forecast = {
    "forecast_valid_time": datetime.datetime(2024, 6, 10, 15, 0, 0),
    "source": "cams-production",
    "forecast_base_time": datetime.datetime(2024, 6, 11, 0, 0, 0),
    "location_type": "city",
    "name": "Test City 3",
    "forecast_range": 0,
    "last_modified_time": datetime.datetime(2024, 6, 10, 7, 49, 53, 664),
    "location": {
        "type": "Point",
        "coordinates": [54.36667, 24.46667],
    },
    "no2": {"aqi_level": 4, "value": 150.79346375328925},
    "o3": {"aqi_level": 3, "value": 101.70172151472397},
    "overall_aqi_level": 4,
    "pm10": {"aqi_level": 2, "value": 30.640266314635},
    "pm2_5": {"aqi_level": 3, "value": 22.76003397454627},
    "so2": {"aqi_level": 2, "value": 103.58745619326088},
    "created_time": datetime.datetime(2024, 6, 10, 7, 49, 53, 664),
}

test_city_1_response_data: dict = {
    "base_time": format_datetime_as_string(
        datetime.datetime(2024, 6, 10, 0, 0, 0), "%Y-%m-%dT%H:%M:%S+00:00"
    ),
    "valid_time": format_datetime_as_string(
        datetime.datetime(2024, 6, 10, 3, 0, 0), "%Y-%m-%dT%H:%M:%S+00:00"
    ),
    "location_type": "city",
    "location_name": "Test City 1",
    "overall_aqi_level": 6,
    "no2": {"aqi_level": 1, "value": 7.79346375328925},
    "o3": {"aqi_level": 4, "value": 212.70172151472397},
    "pm2_5": {"aqi_level": 4, "value": 48.76003397454627},
    "pm10": {"aqi_level": 6, "value": 205.640266314635},
    "so2": {"aqi_level": 1, "value": 7.58745619326088},
}


test_city_2_response_data: dict = {
    "base_time": format_datetime_as_string(
        datetime.datetime(2024, 6, 10, 0, 0, 0), "%Y-%m-%dT%H:%M:%S+00:00"
    ),
    "valid_time": format_datetime_as_string(
        datetime.datetime(2024, 6, 12, 0, 0, 0), "%Y-%m-%dT%H:%M:%S+00:00"
    ),
    "location_type": "city",
    "location_name": "Test City 2",
    "overall_aqi_level": 6,
    "no2": {"aqi_level": 6, "value": 350.76859403417895},
    "o3": {"aqi_level": 5, "value": 261.70172151472397},
    "pm2_5": {"aqi_level": 1, "value": 9.76003397454627},
    "pm10": {"aqi_level": 1, "value": 10.640266314635},
    "so2": {"aqi_level": 3, "value": 212.58745619326088},
}

# API GET request
base_url = "http://127.0.0.1:8000/air-pollutant/forecast"
headers = {"accept": "application/json"}
location_type = "city"

base_time = datetime.datetime(2024, 6, 10, 0, 0)
base_time_string = format_datetime_as_string(
    base_time,
    "%Y-%m-%dT%H:%M:%S+00:00",
)
valid_time_from = base_time_string
valid_time_to = format_datetime_as_string(
    datetime.datetime(2024, 6, 15, 0, 0), "%Y-%m-%dT%H:%M:%S+00:00"
)

# Test Setup
setup_purge_database_and_seed_with_test_data(
    ".env-qa",
    "forecast_data",
    [test_city_1_input_data, test_city_2_input_data, test_city_3_input_data],
)


@pytest.mark.parametrize(
    "test_base_time, test_location_name, expected_cities",
    [
        (datetime.datetime(2024, 6, 10, 0, 0), "", ["Test City 1", "Test City 2"]),
        (datetime.datetime(2024, 6, 10, 0, 0), "Test City 1", ["Test City 1"]),
        (datetime.datetime(2024, 6, 11, 0, 0, 0), "", ["Test City 3"]),
    ],
)
def test__different_base_times__assert_correct_results_returned(
    test_base_time,
    test_location_name: str,
    expected_cities: list,
):
    test_base_time_string = format_datetime_as_string(
        test_base_time, "%Y-%m-%dT%H:%M:%S+00:00"
    )
    response = get_forecast(
        test_base_time_string,
        valid_time_from,
        valid_time_to,
        location_type,
        test_location_name,
        base_url,
        headers,
    )
    expected = expected_cities
    actual_cities = get_list_of_keys(response.json(), "location_name")
    for city in actual_cities:
        index = actual_cities.index(city)
        assert city == expected[index]


@pytest.mark.parametrize(
    "test_location_name, test_base_time, expected",
    [
        ("", datetime.datetime(2024, 6, 9, 12, 0, 0), 0),
        ("", datetime.datetime(2024, 6, 10, 0, 0, 0), 2),
        ("", datetime.datetime(2024, 6, 10, 12, 0, 0), 0),
        ("Test City 1", datetime.datetime(2024, 6, 9, 12, 0, 0), 0),
        ("Test City 1", datetime.datetime(2024, 6, 10, 0, 0, 0), 1),
        ("Test City 1", datetime.datetime(2024, 6, 10, 12, 0, 0), 0),
    ],
)
def test__base_time_bva__assert_number_of_results(
    test_location_name: str, test_base_time: datetime.datetime, expected: int
):
    test_base_time_string = format_datetime_as_string(
        test_base_time,
        "%Y-%m-%dT%H:%M:%S+00:00",
    )

    response = get_forecast(
        test_base_time_string,
        valid_time_from,
        valid_time_to,
        location_type,
        test_location_name,
        base_url,
        headers,
    )

    response_json = response.json()
    assert len(response_json) == expected


@pytest.mark.parametrize(
    "test_valid_time_from, test_location_name, expected_cities",
    [
        (datetime.datetime(2024, 6, 10, 0, 0, 0), "", ["Test City 1", "Test City 2"]),
        (datetime.datetime(2024, 6, 11, 0, 0, 0), "", ["Test City 2"]),
        (datetime.datetime(2024, 6, 10, 0, 0, 0), "Test City 1", ["Test City 1"]),
        (datetime.datetime(2024, 6, 11, 0, 0, 0), "Test City 2", ["Test City 2"]),
    ],
)
def test__different_valid_time_from_times__assert_correct_results(
    test_valid_time_from: datetime.datetime,
    test_location_name: str,
    expected_cities: list,
):
    test_valid_date_from_string = format_datetime_as_string(
        test_valid_time_from, "%Y-%m-%dT%H:%M:%S+00:00"
    )

    response = get_forecast(
        base_time_string,
        test_valid_date_from_string,
        valid_time_to,
        location_type,
        test_location_name,
        base_url,
        headers,
    )

    expected = expected_cities
    actual_cities = get_list_of_keys(response.json(), "location_name")
    for city in actual_cities:
        index = actual_cities.index(city)
        assert city == expected[index]


@pytest.mark.parametrize(
    "test_valid_time_from, test_location_name, expected",
    [
        (datetime.datetime(2024, 6, 10, 0, 0, 0), "", 2),
        (datetime.datetime(2024, 6, 10, 3, 0, 0), "", 2),
        (datetime.datetime(2024, 6, 10, 6, 0, 0), "", 1),
        (datetime.datetime(2024, 6, 10, 0, 0, 0), "Test City 1", 1),
        (datetime.datetime(2024, 6, 10, 3, 0, 0), "Test City 1", 1),
        (datetime.datetime(2024, 6, 10, 6, 0, 0), "Test City 1", 0),
    ],
)
def test__valid_time_from_bva__assert_number_of_results(
    test_valid_time_from: datetime.datetime, test_location_name: str, expected: int
):
    test_valid_time_from_string = format_datetime_as_string(
        test_valid_time_from,
        "%Y-%m-%dT%H:%M:%S+00:00",
    )

    response = get_forecast(
        base_time_string,
        test_valid_time_from_string,
        valid_time_to,
        location_type,
        test_location_name,
        base_url,
        headers,
    )

    response_json = response.json()
    assert len(response_json) == expected


@pytest.mark.parametrize(
    "test_valid_time_to, test_location_name, expected_cities",
    [
        (datetime.datetime(2024, 6, 11, 0, 0, 0), "", ["Test City 1"]),
        (datetime.datetime(2024, 6, 12, 0, 0, 0), "", ["Test City 1", "Test City 2"]),
        (datetime.datetime(2024, 6, 11, 0, 0, 0), "Test City 2", []),
        (datetime.datetime(2024, 6, 12, 0, 0, 0), "Test City 2", ["Test City 2"]),
    ],
)
def test__different_valid_time_to_times__assert_correct_results(
    test_valid_time_to: datetime.datetime,
    test_location_name: str,
    expected_cities: list,
):
    test_valid_time_to_string = format_datetime_as_string(
        test_valid_time_to, "%Y-%m-%dT%H:%M:%S+00:00"
    )

    response = get_forecast(
        base_time_string,
        test_valid_time_to_string,
        valid_time_from,
        location_type,
        test_location_name,
        base_url,
        headers,
    )

    expected = expected_cities
    actual_cities = get_list_of_keys(response.json(), "location_name")
    for city in actual_cities:
        index = actual_cities.index(city)
        assert city == expected[index]


@pytest.mark.parametrize(
    "test_valid_time_to, test_location_name, expected",
    [
        (datetime.datetime(2024, 6, 11, 12, 0, 0), "", 1),
        (datetime.datetime(2024, 6, 12, 0, 0, 0), "", 2),
        (datetime.datetime(2024, 6, 12, 12, 0, 0), "", 2),
        (datetime.datetime(2024, 6, 11, 12, 0, 0), "Test City 1", 1),
        (datetime.datetime(2024, 6, 12, 0, 0, 0), "Test City 1", 1),
        (datetime.datetime(2024, 6, 12, 0, 0, 0), "Test City 2", 1),
    ],
)
def test__valid_time_to_bva__assert_number_of_results(
    test_valid_time_to, test_location_name: str, expected: int
):
    test_valid_time_to_string = format_datetime_as_string(
        test_valid_time_to,
        "%Y-%m-%dT%H:%M:%S+00:00",
    )

    response = get_forecast(
        base_time_string,
        valid_time_from,
        test_valid_time_to_string,
        location_type,
        test_location_name,
        base_url,
        headers,
    )

    response_json = response.json()
    assert len(response_json) == expected


@pytest.mark.parametrize("test_location_name", ("", "Test City 1"))
def test__results_containing_relevant_base_time(
    test_location_name: str,
):
    response = get_forecast(
        base_time_string,
        valid_time_from,
        valid_time_to,
        location_type,
        test_location_name,
        base_url,
        headers,
    )
    response_json = response.json()
    for forecast in response_json:
        assert forecast["base_time"] == base_time_string


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


@pytest.mark.parametrize(
    "test_location_name, expected_response",
    [
        (
            "",
            [
                test_city_1_response_data,
                test_city_2_response_data,
            ],
        ),
        (
            "Test City 2",
            [
                test_city_2_response_data,
            ],
        ),
    ],
)
def test__assert_response_keys_and_values_are_correct(
    test_location_name: str, expected_response: list
):
    pprint.pprint(expected_response)
    response = get_forecast(
        base_time_string,
        valid_time_from,
        valid_time_to,
        location_type,
        test_location_name,
        base_url,
        headers,
    )
    response_json = response.json()
    pprint.pprint(response_json)
    assert response_json == expected_response
