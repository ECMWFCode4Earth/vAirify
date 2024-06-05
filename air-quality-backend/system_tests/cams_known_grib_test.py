from datetime import timezone, datetime

from system_tests.utils.cams_utilities import delete_database_data
from scripts.run_forecast_etl import main
from system_tests.utils.cams_utilities import get_database_data
import os
from dotenv import load_dotenv
from unittest import mock

load_dotenv()


@mock.patch.dict(
    os.environ,
    {
        "FORECAST_BASE_DATE": "2024-06-04",
        "FORECAST_BASE_TIME": "00",
    },
)
def test_known_vancouver_grib():
    delete_database_data("forecast_data")
    main()
    query = {
        'name': 'Vancouver',
        'forecast_valid_time': {
            '$eq': datetime(2024, 6, 4, 3, 0, 0, tzinfo=timezone.utc)
        },
        'forecast_base_time': {
            '$eq': datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc)
        },
        'location_type': 'city',
        'source': 'cams-production'
    }
    dict_result = get_database_data(query, "forecast_data")

    for document in dict_result:
        assert (document["name"] == "Vancouver"), f"name does not match the search query!"
        assert (document["forecast_valid_time"] == datetime(2024, 6, 4, 3, 0))
        assert (document["forecast_base_time"] == datetime(2024, 6, 4, 0, 0))
        assert (document["no2_value"] == 10.115771485462055)
        assert (document["o3_value"] == 63.39522524659603)
        assert (document["so2_value"] == 2.000387638160907)
        assert (document["pm10_value"] == 5.810208243195257)
        assert (document["pm2_5_value"] == 3.6327574082026914)


if __name__ == "__main__":
    test_known_vancouver_grib()
