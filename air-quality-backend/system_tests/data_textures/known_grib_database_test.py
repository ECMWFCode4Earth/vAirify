import copy
import random
from datetime import timezone, datetime, timedelta
import pytest

from etl.scripts.run_forecast_etl import main
import os
from dotenv import load_dotenv
from unittest import mock

from system_tests.utils.database_utilities import (
    delete_database_data,
    get_database_data,
)

load_dotenv()
forecast_base_time = datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc)
data_query = {"forecast_base_time": {"$eq": forecast_base_time}}


@pytest.fixture(scope="module")
def setup_data():
    # Set up code
    with mock.patch.dict(os.environ, {
        "FORECAST_BASE_TIME": "2024-6-4 00",
        "FORECAST_RETRIEVAL_PERIOD": "0"
    }):
        delete_database_data("data_textures", data_query)
        main()
        yield


def test_epic_test(setup_data):
    dict_result = get_database_data("data_textures", data_query)
    expected_doc_count = 7 * 3
    assert (len(dict_result) == expected_doc_count), f"Expected {expected_doc_count} documents for one forecast_base_time"


