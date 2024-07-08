import os
from datetime import datetime
from unittest import mock

import pytest
from dotenv import load_dotenv

from scripts.run_forecast_etl import main
from system_tests.utils.database_utilities import delete_database_data, \
    get_database_data

load_dotenv()

query = {"forecast_base_time": {"$eq": datetime(2024, 6, 10, 0)}}
single_filename = "single_level_41_from_2024-06-10_00.grib"
multi_filename = "multi_level_41_from_2024-06-10_00.grib"


@pytest.fixture()
def setup_grib_cache_tests():
    # Set up code
    delete_database_data("forecast_data", query)
    if os.path.exists(single_filename):
        os.remove(single_filename)
    if os.path.exists(multi_filename):
        os.remove(multi_filename)
    yield


def test__grib_cache__file_not_stored_when_not_set_to_cache(setup_grib_cache_tests):
    with mock.patch.dict(
            os.environ,
            {
                "FORECAST_BASE_TIME": "2024-6-10 00",
                "STORE_GRIB_FILES": "False"
            }
    ):
        main()

    # File has not been cached
    assert os.path.exists(single_filename) == False
    assert os.path.exists(multi_filename) == False

    # Data has been stored
    stored_data = get_database_data("forecast_data", query)
    assert len(stored_data) > 0


def test__grib_cache__file_not_stored_by_default(setup_grib_cache_tests):
    with mock.patch.dict(
            os.environ,
            {
                "FORECAST_BASE_TIME": "2024-6-10 00",
            }
    ):
        main()

    # File has not been cached
    assert os.path.exists(single_filename) == False
    assert os.path.exists(multi_filename) == False

    # Data has been stored
    stored_data = get_database_data("forecast_data", query)
    assert len(stored_data) > 0


def test__grib_cache__file_stored_when_set_to_cache(setup_grib_cache_tests):
    with mock.patch.dict(
            os.environ,
            {
                "FORECAST_BASE_TIME": "2024-6-10 00",
                "STORE_GRIB_FILES": "True"
            }
    ):
        main()

    # File has been cached
    assert os.path.isfile(single_filename) == True
    assert os.path.isfile(multi_filename) == True

    # Data has been stored
    stored_data = get_database_data("forecast_data", query)
    assert len(stored_data) > 0