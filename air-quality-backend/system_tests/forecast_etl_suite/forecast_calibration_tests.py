import datetime
import pytest
from dotenv import load_dotenv

from system_tests.data.cities_data import all_cities
from system_tests.utils.cams_utilities import (
    get_ecmwf_forecast_to_dict_for_countries,
    get_database_data,
    get_forecast_percentage_divergence,
)

# Test setup
load_dotenv(".env-qa")

ecmwf_forecast_file_path = ""  # Path to ECMWF forecast file from air-quality-backend
ecmwf_locations_file_path = "system_tests/forecast_etl_suite/CAMS_locations_V1.csv"

ecmwf_all_data = get_ecmwf_forecast_to_dict_for_countries(
    ecmwf_locations_file_path, ecmwf_forecast_file_path
)
database_all_data = get_database_data({}, "forecast_data")

# Shared test parameters
test_forecast_base_time = datetime.datetime(2024, 6, 17, 00, 00, 00)
test_forecast_valid_time = datetime.datetime(
    2024, 6, 17, 12, 00, 00
)  # Set a valid time to test against
allowed_divergence_percentage = 3


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_o3_with_database_o3(test_city: str):
    divergence_percentage = get_forecast_percentage_divergence(
        test_city,
        test_forecast_valid_time,
        ecmwf_all_data,
        test_forecast_base_time,
        database_all_data,
        "o3",
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "Divergence: {}%".format(divergence_percentage)


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_no2_with_database_no2(test_city: str):
    divergence_percentage = get_forecast_percentage_divergence(
        test_city,
        test_forecast_valid_time,
        ecmwf_all_data,
        test_forecast_base_time,
        database_all_data,
        "no2",
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "Divergence: {}%".format(divergence_percentage)


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_pm10_with_database_pm10(test_city: str):
    divergence_percentage = get_forecast_percentage_divergence(
        test_city,
        test_forecast_valid_time,
        ecmwf_all_data,
        test_forecast_base_time,
        database_all_data,
        "pm10",
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "Divergence: {}%".format(divergence_percentage)


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_pm2_5_with_database_pm2_5(test_city: str):
    divergence_percentage = get_forecast_percentage_divergence(
        test_city,
        test_forecast_valid_time,
        ecmwf_all_data,
        test_forecast_base_time,
        database_all_data,
        "pm2.5",
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "Divergence: {}%".format(divergence_percentage)
