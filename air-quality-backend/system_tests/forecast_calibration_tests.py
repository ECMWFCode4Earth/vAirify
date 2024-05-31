import datetime
import pytest
from dotenv import load_dotenv

from system_tests.cities_data import all_cities
from system_tests.utils.helper_methods import (
    get_ecmwf_forecast_to_dict_for_countries,
    get_database_data,
    calculate_database_divergence_from_ecmwf_forecast_values,
)

# Test setup
ecmwf_forecast_file_path = "system_tests/CAMS_surface_concentration_2024053100_V1.csv"  # Add local path to downloaded file from air-quality-backend
test_forecast_base_time = datetime.datetime(
    2024, 5, 31, 00, 00, 00
)  # Ensure this corresponds to ecmwf forecast file base time

load_dotenv(".env-qa")
ecmwf_all_data = get_ecmwf_forecast_to_dict_for_countries(ecmwf_forecast_file_path)
database_all_data = get_database_data("forecast_data")

# Shared test parameters
test_forecast_valid_time = datetime.datetime(
    2024, 5, 31, 3, 00, 00
)  # Set a valid time to test against
allowed_divergence_percentage = 2


@pytest.mark.parametrize("city", all_cities)
def test_compare_ecmwf_o3_with_database_o3(city: str):
    # Test parameters
    test_city = city

    ecmwf_record_for_city_and_valid_time = list(
        filter(
            lambda x: x["location_name"] == test_city
            and x["valid_time"] == test_forecast_valid_time.strftime("%Y-%m-%dT%H:%M"),
            ecmwf_all_data,
        )
    )

    database_record_for_city_and_valid_time = list(
        filter(
            lambda x: x["forecast_base_time"] == test_forecast_base_time
            and x["name"] == test_city
            and x["forecast_valid_time"] == test_forecast_valid_time,
            database_all_data,
        )
    )

    database_o3_value = database_record_for_city_and_valid_time[0]["o3_value"]
    ecmwf_forecast_o3_value = ecmwf_record_for_city_and_valid_time[0]["O3"]

    divergence_percentage = calculate_database_divergence_from_ecmwf_forecast_values(
        database_o3_value, ecmwf_forecast_o3_value
    )
    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "ECMWF forecast: {}, Database value: {}, Divergence: {}%".format(
        ecmwf_forecast_o3_value, database_o3_value, divergence_percentage
    )


@pytest.mark.parametrize("city", all_cities)
def test_compare_ecmwf_no2_with_database_no2(city: str):
    # Test parameters
    test_city = city

    ecmwf_record_for_city_and_valid_time = list(
        filter(
            lambda x: x["location_name"] == test_city
            and x["valid_time"] == test_forecast_valid_time.strftime("%Y-%m-%dT%H:%M"),
            ecmwf_all_data,
        )
    )

    database_record_for_city_and_valid_time = list(
        filter(
            lambda x: x["forecast_base_time"] == test_forecast_base_time
            and x["name"] == test_city
            and x["forecast_valid_time"] == test_forecast_valid_time,
            database_all_data,
        )
    )

    database_no2_value = database_record_for_city_and_valid_time[0]["no2_value"]
    ecmwf_forecast_no2_value = ecmwf_record_for_city_and_valid_time[0]["NO2"]

    divergence_percentage = calculate_database_divergence_from_ecmwf_forecast_values(
        database_no2_value, ecmwf_forecast_no2_value
    )
    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "ECMWF forecast: {}, Database value: {}, Divergence: {}%".format(
        ecmwf_forecast_no2_value, database_no2_value, divergence_percentage
    )


@pytest.mark.parametrize("city", all_cities)
def test_compare_ecmwf_pm10_with_database_pm10(city: str):
    # Test parameters
    test_city = city

    ecmwf_record_for_city_and_valid_time = list(
        filter(
            lambda x: x["location_name"] == test_city
            and x["valid_time"] == test_forecast_valid_time.strftime("%Y-%m-%dT%H:%M"),
            ecmwf_all_data,
        )
    )

    database_record_for_city_and_valid_time = list(
        filter(
            lambda x: x["forecast_base_time"] == test_forecast_base_time
            and x["name"] == test_city
            and x["forecast_valid_time"] == test_forecast_valid_time,
            database_all_data,
        )
    )

    database_pm10_value = database_record_for_city_and_valid_time[0]["pm10_value"]
    ecmwf_forecast_pm10_value = ecmwf_record_for_city_and_valid_time[0]["PM10"]

    divergence_percentage = calculate_database_divergence_from_ecmwf_forecast_values(
        database_pm10_value, ecmwf_forecast_pm10_value
    )
    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "ECMWF forecast: {}, Database value: {}, Divergence: {}%".format(
        ecmwf_forecast_pm10_value, database_pm10_value, divergence_percentage
    )


@pytest.mark.parametrize("city", all_cities)
def test_compare_ecmwf_pm2_5_with_database_pm2_5(city: str):
    # Test parameters
    test_city = city

    ecmwf_record_for_city_and_valid_time = list(
        filter(
            lambda x: x["location_name"] == test_city
            and x["valid_time"] == test_forecast_valid_time.strftime("%Y-%m-%dT%H:%M"),
            ecmwf_all_data,
        )
    )

    database_record_for_city_and_valid_time = list(
        filter(
            lambda x: x["forecast_base_time"] == test_forecast_base_time
            and x["name"] == test_city
            and x["forecast_valid_time"] == test_forecast_valid_time,
            database_all_data,
        )
    )

    database_pm2_5_value = database_record_for_city_and_valid_time[0]["pm2_5_value"]
    ecmwf_forecast_pm2_5_value = ecmwf_record_for_city_and_valid_time[0]["PM2.5"]

    divergence_percentage = calculate_database_divergence_from_ecmwf_forecast_values(
        database_pm2_5_value, ecmwf_forecast_pm2_5_value
    )
    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "ECMWF forecast: {}, Database value: {}, Divergence: {}% ".format(
        ecmwf_forecast_pm2_5_value, database_pm2_5_value, divergence_percentage
    )
