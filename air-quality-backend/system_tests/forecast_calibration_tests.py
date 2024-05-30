import datetime
import pprint

import pytest
from dotenv import load_dotenv

from system_tests.utils.helper_methods import (
    get_ecmwf_forecast_to_dict_for_countries,
    get_database_data,
)

# Test setup
ecmwf_forecast_file_path = "system_tests/CAMS_surface_concentration_2024053000_V1.csv"
load_dotenv(".env-qa")
ecmwf_all_data = get_ecmwf_forecast_to_dict_for_countries(ecmwf_forecast_file_path)
database_all_data = get_database_data("forecast_data")
allowed_divergence_percentage = 0.1


@pytest.mark.parametrize(
    "city",
    [
        "Vancouver",
        "San Francisco",
        "Los Angeles",
        "Abidjan",
        "Madrid",
        "Accra",
        "London",
        "Barcelona",
        "Brisbane",
        "Auckland",
        "Wellington",
    ],
)
def test_cities_with_extreme_longitudes_o3(city: str):
    # Test parameters
    test_city = city
    test_forecast_base_time = datetime.datetime(2024, 5, 30, 00, 00, 00)
    test_forecast_valid_time = datetime.datetime(2024, 5, 30, 3, 00, 00)

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

    database_ozone_value = database_record_for_city_and_valid_time[0]["o3_value"]
    ecmwf_forecast_ozone_value = ecmwf_record_for_city_and_valid_time[0]["O3"]
    divergence_percentage = (
        (database_ozone_value - ecmwf_forecast_ozone_value) / ecmwf_forecast_ozone_value
    ) * 100
    if divergence_percentage < 0:
        formatted_divergence_percentage = divergence_percentage * -1
    else:
        formatted_divergence_percentage = divergence_percentage

    print(divergence_percentage)
    print(formatted_divergence_percentage)
    print(allowed_divergence_percentage)

    assert (
        formatted_divergence_percentage <= allowed_divergence_percentage
    ), "ECMWF forecast: {}, Database value: {}".format(
        ecmwf_forecast_ozone_value, database_ozone_value
    )
