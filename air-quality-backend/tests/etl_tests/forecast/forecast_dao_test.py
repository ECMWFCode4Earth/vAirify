from datetime import datetime
import pytest
from unittest.mock import call, patch
from src.etl.forecast.forecast_dao import (
    get_single_level_request_body,
    get_multi_level_request_body,
    fetch_forecast_data,
)
from .mock_forecast_data import single_level_data_set, multi_level_data_set


@pytest.fixture
def mock_open_dataset():
    with patch("xarray.open_dataset") as mock_open:
        yield mock_open


def test_get_single_level_request_body():
    request = get_single_level_request_body("2024-04-29", "00")
    assert request == {
        "date": "2024-04-29/2024-04-29",
        "type": "forecast",
        "format": "grib",
        "time": "00:00",
        "leadtime_hour": [
            "24",
            "27",
            "30",
            "33",
            "36",
            "39",
            "42",
            "45",
            "48",
            "51",
            "54",
            "57",
            "60",
            "63",
            "66",
            "69",
            "72",
            "75",
            "78",
            "81",
            "84",
            "87",
            "90",
            "93",
            "96",
            "99",
            "102",
            "105",
            "108",
            "111",
            "114",
            "117",
            "120",
        ],
        "variable": ["particulate_matter_10um", "particulate_matter_2.5um"],
    }


def test_get_multi_level_request_body():
    request = get_multi_level_request_body("2024-04-29", "00")
    assert request == {
        "date": "2024-04-29/2024-04-29",
        "type": "forecast",
        "format": "grib",
        "time": "00:00",
        "leadtime_hour": [
            "24",
            "27",
            "30",
            "33",
            "36",
            "39",
            "42",
            "45",
            "48",
            "51",
            "54",
            "57",
            "60",
            "63",
            "66",
            "69",
            "72",
            "75",
            "78",
            "81",
            "84",
            "87",
            "90",
            "93",
            "96",
            "99",
            "102",
            "105",
            "108",
            "111",
            "114",
            "117",
            "120",
        ],
        "variable": ["nitrogen_dioxide", "ozone", "sulphur_dioxide"],
        "model_level": "137",
    }


def test_fetch_forecast_data_returns_forecast_data(mocker, mock_open_dataset):
    mock_cdsapi_client = mocker.Mock()
    mocker.patch("cdsapi.Client", return_value=mock_cdsapi_client)
    mock_open_dataset.side_effect = [single_level_data_set, multi_level_data_set]

    date = datetime.strptime("2024-05-20", "%Y-%m-%d")
    forecast_data = fetch_forecast_data(model_base_date=date)

    mock_open_dataset.assert_has_calls(
        [
            call(
                "single_level_2024-05-20_00.grib",
                decode_times=False,
                engine="cfgrib",
                backend_kwargs={"indexpath": ""},
            ),
            call(
                "multi_level_2024-05-20_00.grib",
                decode_times=False,
                engine="cfgrib",
                backend_kwargs={"indexpath": ""},
            ),
        ]
    )
    assert forecast_data._single_level_data == single_level_data_set
    assert forecast_data._multi_level_data == multi_level_data_set
