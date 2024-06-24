import os
import pytest

from dotenv import load_dotenv
from ftplib import FTP
from datetime import datetime, timedelta

from freezegun import freeze_time

from system_tests.data.cities_data import all_cities
from system_tests.utils.cams_utilities import (
    get_ecmwf_forecast_to_dict_for_countries,
    get_forecast_percentage_divergence,
)
from system_tests.utils.database_utilities import get_database_data
from scripts.run_forecast_etl import main

load_dotenv()
allowed_divergence_percentage = 3


@pytest.fixture(scope="module")
def retrieve_test_data():
    # Let's go back a day, so we know the forecast will have taken place
    yest = datetime.utcnow() - timedelta(days=1)
    forecast_base_time = datetime(yest.year, yest.month, yest.day)
    forecast_valid_time = forecast_base_time + timedelta(hours=12)

    # Get the CNN data to compare against
    ecmwf_forecast_file_path = retrieve_cnn_data(forecast_base_time)
    ecmwf_locations_file_path = "system_tests/forecast_etl_suite/CAMS_locations_V1.csv"
    ecmwf_all_data = get_ecmwf_forecast_to_dict_for_countries(
        ecmwf_locations_file_path, ecmwf_forecast_file_path
    )

# TODO - Add a check for there already being stuff there?
    # Ensure the forecast has been run for the time we're trying
    with freeze_time(forecast_valid_time):
        main()

    database_all_data = get_database_data("forecast_data")

    yield (forecast_base_time,
           forecast_valid_time,
           database_all_data,
           ecmwf_all_data)

    os.remove(ecmwf_forecast_file_path)


def retrieve_cnn_data(base_forecast_date: datetime):
    url_date = base_forecast_date.strftime("%Y%m%d%H")
    cnn_data = f"CAMS_surface_concentration_{url_date}_V1.csv"

    with FTP('bol-ftp.ecmwf.int', user='anonymous') as ftp:
        ftp.cwd('public/cams/products/cams_global_forecast/surface_concentrations')
        with open(cnn_data, "wb") as file:
            ftp.retrbinary(f"RETR {cnn_data}", file.write)

    return cnn_data


@pytest.mark.parametrize("test_city", all_cities)
def test_compare_ecmwf_o3_with_database_o3(test_city: str, retrieve_test_data):
    (forecast_base_time,
     forecast_valid_time,
     database_all_data,
     ecmwf_all_data) = retrieve_test_data

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
    (forecast_base_time,
     forecast_valid_time,
     database_all_data,
     ecmwf_all_data) = retrieve_test_data
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
    (forecast_base_time,
     forecast_valid_time,
     database_all_data,
     ecmwf_all_data) = retrieve_test_data
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
    (forecast_base_time,
     forecast_valid_time,
     database_all_data,
     ecmwf_all_data) = retrieve_test_data
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
