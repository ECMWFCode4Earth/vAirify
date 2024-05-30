import pprint
from datetime import datetime

from dotenv import load_dotenv

from system_tests.utils.helper_methods import (
    get_ecmwf_forecast_to_dict_for_countries,
    get_database_data,
    get_database_record_by_key_with_datetime,
    get_database_record_for_city_and_valid_time,
)

# Test parameters
test_city = "Vancouver"
test_forecast_base_time = datetime(2024, 5, 30, 00, 00, 00)
test_forecast_valid_time = datetime(2024, 5, 30, 3, 00, 00)


load_dotenv(".env-qa")

ecmwf_forecast_file_path = "system_tests/CAMS_surface_concentration_2024053000_V1.csv"
ecmwf_all = get_ecmwf_forecast_to_dict_for_countries(ecmwf_forecast_file_path)
ecmwf_vancouver_subset = []
ecmwf_vancouver_valid_time_subset = []

get_database_record_for_city_and_valid_time(
    ecmwf_all,
    test_city,
    ecmwf_vancouver_subset,
    test_forecast_valid_time,
    ecmwf_vancouver_valid_time_subset,
)

database_vancouver_subset = get_database_data(
    {
        "$and": [
            {"name": test_city},
            {"forecast_base_time": test_forecast_base_time},
        ]
    },
    "forecast_data",
    {
        "_id": 0,
        "location_type": 0,
        "source": 0,
        "location": 0,
        "overall_aqi_level:": 0,
    },
)
database_vancouver_valid_time_subset = get_database_record_by_key_with_datetime(
    database_vancouver_subset,
    "forecast_valid_time",
    test_forecast_valid_time,
)


def test_vancouver_o3():
    assert (
        database_vancouver_valid_time_subset["o3_value"]
        == ecmwf_vancouver_valid_time_subset[0]["O3"]
    )


def test_vancouver_no2():
    assert (
        database_vancouver_valid_time_subset["no2_value"]
        == ecmwf_vancouver_valid_time_subset[0]["NO2"]
    )


def test_vancouver_pm10():
    assert (
        database_vancouver_valid_time_subset["pm10_value"]
        == ecmwf_vancouver_valid_time_subset[0]["PM10"]
    )


def test_vancouver_pm2_5():
    assert (
        database_vancouver_valid_time_subset["pm2_5_value"]
        == ecmwf_vancouver_valid_time_subset[0]["PM2.5"]
    )
