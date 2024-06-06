from datetime import timezone, datetime
import pytest
from system_tests.utils.cams_utilities import delete_database_data
from scripts.run_forecast_etl import main
from system_tests.utils.cams_utilities import get_database_data
import os
from dotenv import load_dotenv
from unittest import mock
import xarray as xr

load_dotenv()

test_cases = [
    (
        {
            "name": "Vancouver",
            "forecast_valid_time": datetime(2024, 6, 4, 3, 0, 0, tzinfo=timezone.utc),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "location_type": "city",
            "source": "cams-production",
        },
        {
            "name": "Vancouver",
            "forecast_valid_time": datetime(2024, 6, 4, 3, 0, 0),
            "forecast_base_time": datetime(2024, 6, 4, 0, 0, 0),
            "no2_value": 10.115771485462055,
            "o3_value": 63.39522524659603,
            "so2_value": 2.000387638160907,
            "pm10_value": 5.810208243195257,
            "pm2_5_value": 3.6327574082026914,
        },
    ),
]


@mock.patch.dict(
    os.environ,
    {
        "FORECAST_BASE_DATE": "2024-06-04",
        "FORECAST_BASE_TIME": "00",
    },
)
@pytest.mark.parametrize("query_params, expected_values", test_cases)
def test_known_vancouver_grib(query_params, expected_values):
    delete_database_data("forecast_data")
    main()
    query = {
        "name": query_params["name"],
        "forecast_valid_time": {"$eq": query_params["forecast_valid_time"]},
        "forecast_base_time": {"$eq": query_params["forecast_base_time"]},
        "location_type": query_params["location_type"],
        "source": query_params["source"],
    }
    dict_result = get_database_data(query, "forecast_data")

    for document in dict_result:
        assert (
                document["name"] == expected_values["name"]
        ), "Name does not match the search query!"
        assert (
                document["forecast_valid_time"] == expected_values["forecast_valid_time"]
        ), "forecast_valid_time does not match!"
        assert (
                document["forecast_base_time"] == expected_values["forecast_base_time"]
        ), "forecast_base_time does not match!"
        assert (
                document["no2_value"] == expected_values["no2_value"]
        ), "no2 value does not match!"
        assert (
                document["o3_value"] == expected_values["o3_value"]
        ), "o3 value does not match!"
        assert (
                document["so2_value"] == expected_values["so2_value"]
        ), "o2 value does not match!"
        assert (
                document["pm10_value"] == expected_values["pm10_value"]
        ), "pm10 value does not match!"
        assert (
                document["pm2_5_value"] == expected_values["pm2_5_value"]
        ), "pm2.5 value does not match!"


if __name__ == "__main__":
    test_known_vancouver_grib()
