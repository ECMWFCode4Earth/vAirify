import pytest

from etl.scripts.run_forecast_etl import main
import os
from unittest import mock

from system_tests.forecast_etl_suite.cams_known_grib_test import data_query
from system_tests.utils.database_utilities import (
    delete_database_data,
    get_database_data,
)


@pytest.fixture(scope="module")
def setup_data():
    # Set up code
    with mock.patch.dict(os.environ, {
        "FORECAST_BASE_TIME": "2024-6-4 00",
        "FORECAST_RETRIEVAL_PERIOD": "0"
    }):
        delete_database_data("forecast_data", data_query)
        main()
        yield


def test__missing_time_london__add_missing_data(
        setup_data
):
    # dict_result = get_database_data("forecast_data", data_query)
    # print(dict_result)
    assert 2 == []
