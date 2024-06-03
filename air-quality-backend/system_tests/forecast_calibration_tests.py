import datetime
import pytest
from dotenv import load_dotenv

from system_tests.cities_data import all_cities
from system_tests.utils.cams_utilities import (
    get_ecmwf_forecast_to_dict_for_countries,
    get_database_data,
    calculate_database_divergence_from_ecmwf_forecast_values,
    get_ecmwf_record_for_city_and_valid_time,
    get_database_record_for_city_and_valid_time,
    get_pollutant_value,
)

# Test setup
load_dotenv(".env-qa")

ecmwf_forecast_file_path = ""  # Path to ECMWF forecast file from air-quality-backend
ecmwf_locations_file_path = ""  # Path to ECMWF locations file from air-quality-backend

ecmwf_all_data = get_ecmwf_forecast_to_dict_for_countries(
    ecmwf_locations_file_path, ecmwf_forecast_file_path
)
database_all_data = get_database_data("forecast_data")

# Shared test parameters
test_forecast_base_time = datetime.datetime(2024, 6, 3, 00, 00, 00)
test_forecast_valid_time = datetime.datetime(
    2024, 6, 3, 6, 00, 00
)  # Set a valid time to test against
allowed_divergence_percentage = 1


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_o3_with_database_o3(test_city: str):
    ecmwf_record_for_city_and_valid_time = get_ecmwf_record_for_city_and_valid_time(
        test_city, test_forecast_valid_time, ecmwf_all_data
    )

    database_record_for_city_and_valid_time = (
        get_database_record_for_city_and_valid_time(
            test_forecast_base_time,
            test_city,
            test_forecast_valid_time,
            database_all_data,
        )
    )

    ecmwf_forecast_o3_value = get_pollutant_value(
        "o3",
        "ecmwf_forecast",
        ecmwf_record_for_city_and_valid_time,
    )
    database_o3_value = get_pollutant_value(
        "o3", "database_forecast", database_record_for_city_and_valid_time
    )

    divergence_percentage = calculate_database_divergence_from_ecmwf_forecast_values(
        database_o3_value, ecmwf_forecast_o3_value
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "ECMWF forecast: {}, Database value: {}, Divergence: {}%".format(
        ecmwf_forecast_o3_value, database_o3_value, divergence_percentage
    )


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_no2_with_database_no2(test_city: str):
    ecmwf_record_for_city_and_valid_time = get_ecmwf_record_for_city_and_valid_time(
        test_city, test_forecast_valid_time, ecmwf_all_data
    )

    database_record_for_city_and_valid_time = (
        get_database_record_for_city_and_valid_time(
            test_forecast_base_time,
            test_city,
            test_forecast_valid_time,
            database_all_data,
        )
    )

    ecmwf_forecast_no2_value = get_pollutant_value(
        "no2",
        "ecmwf_forecast",
        ecmwf_record_for_city_and_valid_time,
    )
    database_no2_value = get_pollutant_value(
        "no2", "database_forecast", database_record_for_city_and_valid_time
    )

    divergence_percentage = calculate_database_divergence_from_ecmwf_forecast_values(
        database_no2_value, ecmwf_forecast_no2_value
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "ECMWF forecast: {}, Database value: {}, Divergence: {}%".format(
        ecmwf_forecast_no2_value, database_no2_value, divergence_percentage
    )


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_pm10_with_database_pm10(test_city: str):
    ecmwf_record_for_city_and_valid_time = get_ecmwf_record_for_city_and_valid_time(
        test_city, test_forecast_valid_time, ecmwf_all_data
    )

    database_record_for_city_and_valid_time = (
        get_database_record_for_city_and_valid_time(
            test_forecast_base_time,
            test_city,
            test_forecast_valid_time,
            database_all_data,
        )
    )

    ecmwf_forecast_pm10_value = get_pollutant_value(
        "pm10",
        "ecmwf_forecast",
        ecmwf_record_for_city_and_valid_time,
    )
    database_pm10_value = get_pollutant_value(
        "pm10", "database_forecast", database_record_for_city_and_valid_time
    )

    divergence_percentage = calculate_database_divergence_from_ecmwf_forecast_values(
        database_pm10_value, ecmwf_forecast_pm10_value
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "ECMWF forecast: {}, Database value: {}, Divergence: {}%".format(
        ecmwf_forecast_pm10_value, database_pm10_value, divergence_percentage
    )


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_pm2_5_with_database_pm2_5(test_city: str):
    ecmwf_record_for_city_and_valid_time = get_ecmwf_record_for_city_and_valid_time(
        test_city, test_forecast_valid_time, ecmwf_all_data
    )

    database_record_for_city_and_valid_time = (
        get_database_record_for_city_and_valid_time(
            test_forecast_base_time,
            test_city,
            test_forecast_valid_time,
            database_all_data,
        )
    )

    ecmwf_forecast_pm2_5_value = get_pollutant_value(
        "pm2.5",
        "ecmwf_forecast",
        ecmwf_record_for_city_and_valid_time,
    )
    database_pm2_5_value = get_pollutant_value(
        "pm2.5", "database_forecast", database_record_for_city_and_valid_time
    )

    divergence_percentage = calculate_database_divergence_from_ecmwf_forecast_values(
        database_pm2_5_value, ecmwf_forecast_pm2_5_value
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "ECMWF forecast: {}, Database value: {}, Divergence: {}% ".format(
        ecmwf_forecast_pm2_5_value, database_pm2_5_value, divergence_percentage
    )
