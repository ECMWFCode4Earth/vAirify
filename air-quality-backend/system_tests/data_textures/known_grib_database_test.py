import copy
from datetime import timezone, datetime, timedelta
import pprint

import pytest
from dotenv import load_dotenv

from etl.scripts.run_forecast_etl import main
import os
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
    with mock.patch.dict(
        os.environ,
        {"FORECAST_BASE_TIME": "2024-6-4 00", "FORECAST_RETRIEVAL_PERIOD": "0"},
    ):
        delete_database_data("data_textures", data_query)
        delete_database_data("forecast_data", data_query)

        main()
        yield


@pytest.mark.parametrize(
    "variable, forecast_base_date, expected_units, expected_max_value, expected_min_value",
    [
        (
            "aqi",
            datetime(2024, 6, 4, 3, 0, 0, tzinfo=timezone.utc),
            "fractional overall AQI",
            7,
            1,
        ),
        (
            "winds_10m",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "m s**-1",
            50,
            -50,
        ),
        (
            "no2",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "kg m**-3 * 1e-9",
            100,
            0,
        ),
        (
            "o3",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "kg m**-3 * 1e-9",
            500,
            0,
        ),
        (
            "pm10",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "kg m**-3 * 1e-9",
            1000,
            0,
        ),
        (
            "pm2_5",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "kg m**-3 * 1e-9",
            1000,
            0,
        ),
        (
            "so2",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "kg m**-3 * 1e-9",
            100,
            0,
        ),
    ],
)
def test__each_variable_has_3_chunks(
    variable,
    forecast_base_date,
    setup_data,
    expected_units,
    expected_min_value,
    expected_max_value,
):
    query = copy.deepcopy(data_query)
    query["variable"] = variable
    query["forecast_base_time"] = {"$eq": forecast_base_time}

    stored_results = get_database_data("data_textures", query)
    assert len(stored_results) == 3

    for result in stored_results:
        assert (
            result["units"] == expected_units
        ), f"Expected units: {expected_units}, but got: {result['units']}"
        assert (
            result["min_value"] == expected_min_value
        ), f"Expected min_value: {expected_min_value}, but got: {result['min_value']}"
        assert (
            result["max_value"] == expected_max_value
        ), f"Expected max_value: {expected_max_value}, but got: {result['max_value']}"


def test__epic_test(setup_data):
    dict_result = get_database_data("data_textures", data_query)
    pprint.pprint(dict_result)
    expected_doc_count = 7 * 3
    assert (
        len(dict_result) == expected_doc_count
    ), f"Expected {expected_doc_count} documents for one forecast_base_time"
