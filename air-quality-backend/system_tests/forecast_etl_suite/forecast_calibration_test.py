import os
from unittest import mock
import pytest

from dotenv import load_dotenv
from ftplib import FTP
from datetime import datetime, timedelta, timezone

from system_tests.data.cities_data import all_cities
from system_tests.utils.cams_utilities import (
    get_ecmwf_forecast_to_dict_for_countries,
    get_forecast_percentage_divergence,
)
from system_tests.utils.database_utilities import get_database_data

from etl.scripts.run_forecast_etl import main

load_dotenv()
allowed_divergence_percentage = 3


@pytest.fixture(scope="module")
def retrieve_test_data():
    # Let's go back a day, so we know the forecast will be available
    yest = datetime.utcnow() - timedelta(days=1)
    forecast_base_time = datetime(yest.year, yest.month, yest.day, tzinfo=timezone.utc)
    forecast_valid_time = forecast_base_time + timedelta(hours=12)

    # Get the ECMWF data to compare against
    ecmwf_forecast_file_path = download_ecmwf_data(forecast_base_time)
    ecmwf_locations_file_path = "system_tests/forecast_etl_suite/CAMS_locations_V1.csv"
    ecmwf_all_data = get_ecmwf_forecast_to_dict_for_countries(
        ecmwf_locations_file_path, ecmwf_forecast_file_path
    )

    ensure_forecast_etl_run(forecast_base_time)
    database_all_data = get_database_data("forecast_data")

    yield (forecast_base_time, forecast_valid_time, database_all_data, ecmwf_all_data)

    os.remove(ecmwf_forecast_file_path)


def download_ecmwf_data(base_forecast_date: datetime):
    url_date = base_forecast_date.strftime("%Y%m%d%H")
    ecmwf_file = f"CAMS_surface_concentration_{url_date}_V1.csv"

    with FTP("bol-ftp.ecmwf.int", user="anonymous") as ftp:
        ftp.cwd("public/cams/products/cams_global_forecast/surface_concentrations")
        with open(ecmwf_file, "wb") as file:
            ftp.retrbinary(f"RETR {ecmwf_file}", file.write)

    return ecmwf_file


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_o3_with_database_o3(test_city: str, retrieve_test_data):
    (forecast_base_time, forecast_valid_time, database_all_data, ecmwf_all_data) = (
        retrieve_test_data
    )

    divergence_percentage = get_forecast_percentage_divergence(
        test_city,
        forecast_valid_time,
        ecmwf_all_data,
        forecast_base_time,
        database_all_data,
        "o3",
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "Divergence: {}%".format(divergence_percentage)


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_no2_with_database_no2(test_city: str, retrieve_test_data):
    (forecast_base_time, forecast_valid_time, database_all_data, ecmwf_all_data) = (
        retrieve_test_data
    )
    divergence_percentage = get_forecast_percentage_divergence(
        test_city,
        forecast_valid_time,
        ecmwf_all_data,
        forecast_base_time,
        database_all_data,
        "no2",
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "Divergence: {}%".format(divergence_percentage)


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_pm10_with_database_pm10(test_city: str, retrieve_test_data):
    (forecast_base_time, forecast_valid_time, database_all_data, ecmwf_all_data) = (
        retrieve_test_data
    )
    divergence_percentage = get_forecast_percentage_divergence(
        test_city,
        forecast_valid_time,
        ecmwf_all_data,
        forecast_base_time,
        database_all_data,
        "pm10",
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "Divergence: {}%".format(divergence_percentage)


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_pm2_5_with_database_pm2_5(test_city: str, retrieve_test_data):
    (forecast_base_time, forecast_valid_time, database_all_data, ecmwf_all_data) = (
        retrieve_test_data
    )
    divergence_percentage = get_forecast_percentage_divergence(
        test_city,
        forecast_valid_time,
        ecmwf_all_data,
        forecast_base_time,
        database_all_data,
        "pm2.5",
    )

    assert (
        divergence_percentage <= allowed_divergence_percentage
    ), "Divergence: {}%".format(divergence_percentage)


def ensure_forecast_etl_run(forecast_base_time):
    filter_forecast = {"forecast_base_time": forecast_base_time}
    existing_data = get_database_data("forecast_data", filter_forecast)
    if not existing_data:
        time_env = forecast_base_time.strftime("%Y-%m-%d %H")
        with mock.patch.dict(os.environ, {"FORECAST_BASE_TIME": time_env}):
            main()
