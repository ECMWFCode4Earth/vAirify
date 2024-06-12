import datetime
import pytest
import requests
from dotenv import load_dotenv
from air_quality.database.in_situ import InSituMeasurement
from system_tests.utils.api_utilities import (
    format_datetime_as_string,
    seed_api_test_data,
    get_list_of_key_values,
)
from system_tests.utils.cams_utilities import delete_database_data
from system_tests.utils.routes import Routes

# Test Data
test_city_1_input_data: InSituMeasurement = {
    "measurement_date": datetime.datetime(
        2024, 6, 11, 14, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "name": "Test City 1",
    "location_name": "Test City 1, Site 1, All keys",
    "api_source": "OpenAQ",
    "created_time": datetime.datetime(
        2024, 6, 11, 14, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "last_modified_time": datetime.datetime(
        2024, 6, 11, 14, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "location": {
        "type": "point",
        "coordinates": [54.433746, 24.424399],
    },
    "location_type": "city",
    "metadata": {
        "entity": "Governmental Organization",
        "sensor_type": "reference grade",
        "estimated_surface_pressure_pa": 100109.546875,
        "estimated_temperature_k": 314.317138671875,
    },
    "no2": {
        "value": 13,
        "unit": "µg/m³",
        "original_value": 13,
        "original_unit": "µg/m³",
    },
    "o3": {
        "value": 48,
        "unit": "µg/m³",
        "original_value": 48,
        "original_unit": "µg/m³",
    },
    "pm2_5": {
        "value": 5.8,
        "unit": "µg/m³",
        "original_value": 5.8,
        "original_unit": "µg/m³",
    },
    "pm10": {
        "value": 15,
        "unit": "µg/m³",
        "original_value": 15,
        "original_unit": "µg/m³",
    },
    "so2": {
        "value": 9,
        "unit": "µg/m³",
        "original_value": 9,
        "original_unit": "µg/m³",
    },
}

test_city_2_1_input_data: InSituMeasurement = {
    "measurement_date": datetime.datetime(
        2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "name": "Test City 2",
    "location_name": "Test City 2, Site 1, All keys",
    "api_source": "OpenAQ",
    "created_time": datetime.datetime(
        2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "last_modified_time": datetime.datetime(
        2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "location": {
        "type": "point",
        "coordinates": [54.433746, 24.424399],
    },
    "location_type": "city",
    "metadata": {
        "entity": "Governmental Organization",
        "sensor_type": "reference grade",
        "estimated_surface_pressure_pa": 100109.546875,
        "estimated_temperature_k": 314.317138671875,
    },
    "no2": {
        "value": 13,
        "unit": "µg/m³",
        "original_value": 13,
        "original_unit": "µg/m³",
    },
    "o3": {
        "value": 48,
        "unit": "µg/m³",
        "original_value": 48,
        "original_unit": "µg/m³",
    },
    "pm2_5": {
        "value": 5.8,
        "unit": "µg/m³",
        "original_value": 5.8,
        "original_unit": "µg/m³",
    },
    "pm10": {
        "value": 15,
        "unit": "µg/m³",
        "original_value": 15,
        "original_unit": "µg/m³",
    },
    "so2": {
        "value": 9,
        "unit": "µg/m³",
        "original_value": 9,
        "original_unit": "µg/m³",
    },
}

test_city_2_2_input_data: InSituMeasurement = {
    "measurement_date": datetime.datetime(
        2024, 6, 12, 15, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "name": "Test City 2",
    "location_name": "Test City 2, Site 2, All keys",
    "api_source": "OpenAQ",
    "created_time": datetime.datetime(
        2024, 6, 12, 15, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "last_modified_time": datetime.datetime(
        2024, 6, 12, 15, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "location": {
        "type": "point",
        "coordinates": [54.433746, 24.424399],
    },
    "location_type": "city",
    "metadata": {
        "entity": "Governmental Organization",
        "sensor_type": "reference grade",
        "estimated_surface_pressure_pa": 100109.546875,
        "estimated_temperature_k": 314.317138671875,
    },
    "no2": {
        "value": 13,
        "unit": "µg/m³",
        "original_value": 13,
        "original_unit": "µg/m³",
    },
    "o3": {
        "value": 48,
        "unit": "µg/m³",
        "original_value": 48,
        "original_unit": "µg/m³",
    },
    "pm2_5": {
        "value": 5.8,
        "unit": "µg/m³",
        "original_value": 5.8,
        "original_unit": "µg/m³",
    },
    "pm10": {
        "value": 15,
        "unit": "µg/m³",
        "original_value": 15,
        "original_unit": "µg/m³",
    },
    "so2": {
        "value": 9,
        "unit": "µg/m³",
        "original_value": 9,
        "original_unit": "µg/m³",
    },
}

test_city_3_input_data: InSituMeasurement = {
    "measurement_date": datetime.datetime(
        2024, 6, 12, 13, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "name": "Test City 3",
    "location_name": "Test City 3, Site 1, All keys",
    "api_source": "OpenAQ",
    "created_time": datetime.datetime(
        2024, 6, 12, 13, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "last_modified_time": datetime.datetime(
        2024, 6, 12, 13, 0, 0, tzinfo=datetime.timezone.utc
    ),
    "location": {
        "type": "point",
        "coordinates": [54.433746, 24.424399],
    },
    "location_type": "city",
    "metadata": {
        "entity": "Governmental Organization",
        "sensor_type": "reference grade",
        "estimated_surface_pressure_pa": 100109.546875,
        "estimated_temperature_k": 314.317138671875,
    },
    "no2": {
        "value": 13,
        "unit": "µg/m³",
        "original_value": 13,
        "original_unit": "µg/m³",
    },
    "o3": {
        "value": 48,
        "unit": "µg/m³",
        "original_value": 48,
        "original_unit": "µg/m³",
    },
    "pm2_5": {
        "value": 5.8,
        "unit": "µg/m³",
        "original_value": 5.8,
        "original_unit": "µg/m³",
    },
    "pm10": {
        "value": 15,
        "unit": "µg/m³",
        "original_value": 15,
        "original_unit": "µg/m³",
    },
    "so2": {
        "value": 9,
        "unit": "µg/m³",
        "original_value": 9,
        "original_unit": "µg/m³",
    },
}

# API GET request
base_url = Routes.measurement_summary_api_url
location_type = "city"
measurement_base_time = datetime.datetime(
    2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc
)
measurement_base_time_string = format_datetime_as_string(
    measurement_base_time,
    "%Y-%m-%dT%H:%M:%S+00:00",
)
measurement_time_range = 90

# Test Setup
load_dotenv(".env-qa")
delete_database_data("in_situ_data")
seed_api_test_data(
    "in_situ_data",
    [
        test_city_1_input_data,
        test_city_2_1_input_data,
        test_city_2_2_input_data,
        test_city_3_input_data,
    ],
)


# Tests


@pytest.mark.parametrize(
    "parameters, expected_city",
    [
        (
            {
                "location_type": location_type,
                "measurement_base_time": measurement_base_time_string,
                "measurement_time_range": measurement_time_range,
            },
            [
                "Test City 2",
                "Test City 3",
            ],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 10, 14, 0, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            [],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 12, 29, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            [],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 12, 30, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 1"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 15, 30, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 1"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 11, 15, 31, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            [],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 12, 29, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 12, 30, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 14, 30, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 2", "Test City 3"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 14, 31, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 2"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 16, 30, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            ["Test City 2"],
        ),
        (
            {
                "location_type": location_type,
                "measurement_base_time": format_datetime_as_string(
                    datetime.datetime(
                        2024, 6, 12, 16, 31, 0, tzinfo=datetime.timezone.utc
                    ),
                    "%Y-%m-%dT%H:%M:%S+00:00",
                ),
                "measurement_time_range": measurement_time_range,
            },
            [],
        ),
    ],
)
def test__different_base_times__assert_data_filtered_appropriately(
    parameters: dict, expected_city: str
):
    load_dotenv(".env-qa")
    response = requests.request("GET", base_url, params=parameters, timeout=5.0)
    actual_locations = get_list_of_key_values(response.json(), "location_name")
    actual_locations.sort()
    if len(actual_locations) > 0:
        for location in actual_locations:
            index = actual_locations.index(location)
            assert location == expected_city[index]
    else:
        assert actual_locations == expected_city
