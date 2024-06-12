import pytest

from datetime import datetime
from unittest.mock import call, patch
from air_quality.etl.forecast.forecast_dao import (
    CamsRequestDetails,
    fetch_forecast_data,
    align_to_cams_publish_time,
    get_multi_level_request_body,
    get_single_level_request_body,
)
from tests.util.mock_forecast_data import single_level_data_set, multi_level_data_set


@pytest.fixture
def mock_open_dataset():
    with patch("xarray.open_dataset") as mock_open:
        yield mock_open


def test__get_single_level_request_body():
    request = get_single_level_request_body(
        CamsRequestDetails(datetime(2024, 4, 29, 0)))
    assert request == {
        "date": "2024-04-29/2024-04-29",
        "type": "forecast",
        "format": "grib",
        "time": "00:00",
        "leadtime_hour": [
            "0",
            "3",
            "6",
            "9",
            "12",
            "15",
            "18",
            "21",
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
        "variable": [
            "particulate_matter_10um",
            "particulate_matter_2.5um",
            "surface_pressure",
        ],
    }


def test__get_multi_level_request_body():
    request = get_multi_level_request_body(
        CamsRequestDetails(datetime(2024, 4, 29, 0)))
    assert request == {
        "date": "2024-04-29/2024-04-29",
        "type": "forecast",
        "format": "grib",
        "time": "00:00",
        "leadtime_hour": [
            "0",
            "3",
            "6",
            "9",
            "12",
            "15",
            "18",
            "21",
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
        "variable": ["nitrogen_dioxide", "ozone", "sulphur_dioxide", "temperature"],
        "model_level": "137",
    }


@pytest.mark.parametrize(
    "str_to_align, expected_str",
    [
        ("2024-05-22 00:00:00", "2024-05-21 12:00:00"),
        ("2024-05-22 09:59:59", "2024-05-21 12:00:00"),
        ("2024-05-22 10:00:00", "2024-05-22 00:00:00"),
        ("2024-05-22 21:59:59", "2024-05-22 00:00:00"),
        ("2024-05-22 22:00:00", "2024-05-22 12:00:00"),
        ("2024-05-22 23:59:59", "2024-05-22 12:00:00"),
    ],
)
def test__align_to_cams_publish_time(str_to_align: str, expected_str: str):
    date_to_align = datetime.strptime(str_to_align, "%Y-%m-%d %H:%M:%S")
    expected = datetime.strptime(expected_str, "%Y-%m-%d %H:%M:%S")

    result = align_to_cams_publish_time(date_to_align)
    assert result == expected


def test_fetch_forecast_data_returns_forecast_data(mocker, mock_open_dataset):
    mock_cdsapi_client = mocker.Mock()
    mocker.patch("cdsapi.Client", return_value=mock_cdsapi_client)
    mock_open_dataset.side_effect = [single_level_data_set, multi_level_data_set]

    forecast_data = fetch_forecast_data(datetime(2024, 5, 20, 0))

    mock_open_dataset.assert_has_calls(
        [
            call(
                "single_level_41_from_2024-05-19_12.grib",
                decode_times=False,
                engine="cfgrib",
                backend_kwargs={"indexpath": ""},
            ),
            call(
                "multi_level_41_from_2024-05-19_12.grib",
                decode_times=False,
                engine="cfgrib",
                backend_kwargs={"indexpath": ""},
            ),
        ]
    )
    assert forecast_data._single_level_data == single_level_data_set
    assert forecast_data._multi_level_data == multi_level_data_set
