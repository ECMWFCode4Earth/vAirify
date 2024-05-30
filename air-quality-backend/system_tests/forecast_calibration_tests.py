import pprint
from datetime import datetime

from dotenv import load_dotenv

from system_tests.utils.helper_methods import (
    get_ecmwf_forecast_to_dict_for_countries,
    get_database_data,
    get_database_record_by_key_with_datetime,
    get_ecmwf_record_by_key_with_string,
)


def test_vancouver_verify_database_ozone_matches_ecmwf_ozone_forecast():
    load_dotenv(".env-qa")

    ecmwf_forecast_dict_all = get_ecmwf_forecast_to_dict_for_countries(
        "system_tests/CAMS_surface_concentration_2024052900_V1.csv"
    )

    ecmwf_forecast_dict_city_subset = []
    ecmwf_forecast_dict_city_and_valid_time_subset = []

    for entry in ecmwf_forecast_dict_all:
        if entry.get("location_name") == "Vancouver":
            ecmwf_forecast_dict_city_subset.append(entry)
            if entry.get("valid_time") == "2024-05-29T03:00":
                ecmwf_forecast_dict_city_and_valid_time_subset.append(entry)

    database_data_dict_city_subset = get_database_data(
        {
            "$and": [
                {"name": "Vancouver"},
                {"forecast_base_time": datetime(2024, 5, 29, 00, 00, 00)},
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
    database_record_with_single_valid_time = get_database_record_by_key_with_datetime(
        database_data_dict_city_subset,
        "forecast_valid_time",
        datetime(2024, 5, 29, 3, 0),
    )

    assert (
        database_record_with_single_valid_time["o3_value"]
        == ecmwf_forecast_dict_city_and_valid_time_subset[0]["O3"]
    )
