import os
from unittest import mock
import pytest

from datetime import datetime
from unittest.mock import call, patch

from freezegun import freeze_time

from etl.src.forecast.forecast_dao import (
    CamsRequestDetails,
    fetch_forecast_data,
    align_to_cams_publish_time,
    get_multi_level_request_body,
    get_single_level_request_body,
)
from shared.tests.util.mock_forecast_data import (
    single_level_data_set,
    multi_level_data_set,
)


@pytest.fixture
def mock_open_dataset():
    with patch("xarray.open_dataset") as mock_open:
        yield mock_open


@pytest.fixture
def mock_os_remove():
    with patch("os.remove") as mock_os:
        yield mock_os


def test__get_single_level_request_body():
    request = get_single_level_request_body(
        CamsRequestDetails(datetime(2024, 4, 29, 0))
    )
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
    request = get_multi_level_request_body(CamsRequestDetails(datetime(2024, 4, 29, 0)))
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
        ("2024-05-22 00:00:00", "2024-05-22 00:00:00"),
        ("2024-05-22 09:59:59", "2024-05-22 00:00:00"),
        ("2024-05-22 10:00:00", "2024-05-22 00:00:00"),
        ("2024-05-22 12:00:00", "2024-05-22 12:00:00"),
        ("2024-05-22 21:59:59", "2024-05-22 12:00:00"),
        ("2024-05-22 22:00:00", "2024-05-22 12:00:00"),
        ("2024-05-22 23:59:59", "2024-05-22 12:00:00"),
    ],
)
@freeze_time("2024-05-28 00:00:00")
def test__align_to_cams_publish_time__older_dates_retrieve_relevant_cams_time(
    str_to_align: str, expected_str: str
):
    date_to_align = datetime.strptime(str_to_align, "%Y-%m-%d %H:%M:%S")
    expected = datetime.strptime(expected_str, "%Y-%m-%d %H:%M:%S")

    result = align_to_cams_publish_time(date_to_align)

    assert result == expected


@pytest.mark.parametrize(
    "current_time, str_to_align, expected_str",
    [
        ("2024-05-22 00:00:00", "2024-05-22 00:00:00", "2024-05-21 12:00:00"),
        ("2024-05-22 09:59:59", "2024-05-22 00:00:00", "2024-05-21 12:00:00"),
        ("2024-05-22 10:00:00", "2024-05-22 00:00:00", "2024-05-22 00:00:00"),
        ("2024-05-22 12:00:00", "2024-05-22 12:00:00", "2024-05-22 00:00:00"),
        ("2024-05-22 21:59:59", "2024-05-22 12:00:00", "2024-05-22 00:00:00"),
        ("2024-05-22 22:00:00", "2024-05-22 12:00:00", "2024-05-22 12:00:00"),
        ("2024-05-22 23:59:59", "2024-05-22 12:00:00", "2024-05-22 12:00:00"),
        ("2024-05-23 00:00:00", "2024-05-22 23:59:59", "2024-05-22 12:00:00"),
    ],
)
def test__align_to_cams_publish_time__same_day_dates_retrieve_relevant_cams_time(
    current_time: str, str_to_align: str, expected_str: str
):
    freezer = freeze_time(current_time)
    try:
        freezer.start()
        date_to_align = datetime.strptime(str_to_align, "%Y-%m-%d %H:%M:%S")
        expected = datetime.strptime(expected_str, "%Y-%m-%d %H:%M:%S")

        result = align_to_cams_publish_time(date_to_align)

        assert result == expected
    finally:
        freezer.stop()


@freeze_time("2024-05-28 11:00:00")
def test__align_to_cams_publish_time__requested_future_base_time_raises_error():
    requested_time = datetime(2024, 5, 28, 11, 00, 1)  # 1 min in the future
    with pytest.raises(ValueError):
        align_to_cams_publish_time(requested_time)


@mock.patch.dict(os.environ, {"STORE_GRIB_FILES": "True"})
def test_fetch_forecast_data_returns_forecast_data(mocker, mock_open_dataset):
    mock_cdsapi_client = mocker.Mock()
    mocker.patch("cdsapi.Client", return_value=mock_cdsapi_client)
    mock_open_dataset.side_effect = [single_level_data_set, multi_level_data_set]

    forecast_data = fetch_forecast_data(datetime(2024, 5, 20, 0))

    mock_open_dataset.assert_has_calls(
        [
            call(
                "single_level_41_from_2024-05-20_00.grib",
                decode_times=False,
                engine="cfgrib",
                backend_kwargs={"indexpath": ""},
            ),
            call(
                "multi_level_41_from_2024-05-20_00.grib",
                decode_times=False,
                engine="cfgrib",
                backend_kwargs={"indexpath": ""},
            ),
        ]
    )
    assert forecast_data._single_level_data == single_level_data_set
    assert forecast_data._multi_level_data == multi_level_data_set


@mock.patch.dict(os.environ, {"STORE_GRIB_FILES": "True"})
def test_fetch_forecast_data_does_not_remove_grib_files_when_configured(
    mocker, mock_open_dataset
):
    mock_cdsapi_client = mocker.Mock()
    mock_os_remove = mocker.Mock()
    mocker.patch("cdsapi.Client", return_value=mock_cdsapi_client)
    mocker.patch("os.remove", return_value=mock_os_remove)
    mock_open_dataset.side_effect = [single_level_data_set, multi_level_data_set]

    fetch_forecast_data(datetime(2024, 5, 20, 0))

    mock_os_remove.assert_not_called()


@mock.patch.dict(os.environ, {"STORE_GRIB_FILES": "False"})
def test_fetch_forecast_data_does_remove_grib_files_when_configured(
    mocker, mock_open_dataset, mock_os_remove
):
    mock_cdsapi_client = mocker.Mock()
    mocker.patch("cdsapi.Client", return_value=mock_cdsapi_client)
    mock_open_dataset.side_effect = [single_level_data_set, multi_level_data_set]

    fetch_forecast_data(datetime(2024, 5, 20, 0))

    mock_os_remove.assert_has_calls(
        [
            call("single_level_41_from_2024-05-20_00.grib"),
            call("multi_level_41_from_2024-05-20_00.grib"),
        ]
    )


@mock.patch.dict(os.environ, {})
def test_fetch_forecast_data_does_remove_grib_files_by_default(
    mocker, mock_open_dataset, mock_os_remove
):
    mock_cdsapi_client = mocker.Mock()
    mocker.patch("cdsapi.Client", return_value=mock_cdsapi_client)
    mock_open_dataset.side_effect = [single_level_data_set, multi_level_data_set]

    fetch_forecast_data(datetime(2024, 5, 20, 0))

    mock_os_remove.assert_has_calls(
        [
            call("single_level_41_from_2024-05-20_00.grib"),
            call("multi_level_41_from_2024-05-20_00.grib"),
        ]
    )
