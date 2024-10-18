import os
from datetime import datetime
from unittest.mock import patch

import pytest
from freezegun import freeze_time

from etl.src.forecast.forecast_date_retriever import align_to_cams_publish_time, \
    retrieve_dates_requiring_forecast


@freeze_time("2024-05-28 02:34:56")
@patch("etl.src.forecast.forecast_date_retriever.align_to_cams_publish_time")
@patch("etl.src.forecast.forecast_date_retriever.get_forecast_dates_between")
def test__retrieve_dates_requiring_forecast__aligns_now_if_no_override(
        mock_get_forecast_dates_from_db,
        mock_align_date_to_cams_publish
):
    mock_align_date_to_cams_publish.return_value = datetime(2024, 5, 28)
    mock_get_forecast_dates_from_db.return_value = []

    retrieve_dates_requiring_forecast()

    mock_align_date_to_cams_publish.assert_called_with(datetime.utcnow())


@freeze_time("2024-05-28 02:34:56")
@patch.dict(os.environ, {"FORECAST_BASE_TIME": "2024-06-01 12"})
@patch("etl.src.forecast.forecast_date_retriever.align_to_cams_publish_time")
@patch("etl.src.forecast.forecast_date_retriever.get_forecast_dates_between")
def test__retrieve_dates_requiring_forecast__aligns_override_if_present(
        mock_get_forecast_dates_from_db,
        mock_align_date_to_cams_publish
):
    mock_align_date_to_cams_publish.return_value = datetime(2024, 5, 28)
    mock_get_forecast_dates_from_db.return_value = []

    retrieve_dates_requiring_forecast()

    mock_align_date_to_cams_publish.assert_called_with(datetime(2024, 6, 1, 12))


@freeze_time("2024-05-28 02:34:56")
@patch("etl.src.forecast.forecast_date_retriever.align_to_cams_publish_time")
@patch("etl.src.forecast.forecast_date_retriever.get_forecast_dates_between")
def test__retrieve_dates_requiring_forecast__default_finds_db_dates_for_two_weeks(
        mock_get_forecast_dates_from_db,
        mock_align_date_to_cams_publish
):
    mock_align_date_to_cams_publish.return_value = datetime(2024, 5, 28)
    mock_get_forecast_dates_from_db.return_value = []

    retrieve_dates_requiring_forecast()

    mock_get_forecast_dates_from_db.assert_called_with(
        datetime(2024, 5, 14),
        datetime(2024, 5, 28))


@freeze_time("2024-05-28 02:34:56")
@patch.dict(os.environ, {"FORECAST_RETRIEVAL_PERIOD": "2"})
@patch("etl.src.forecast.forecast_date_retriever.align_to_cams_publish_time")
@patch("etl.src.forecast.forecast_date_retriever.get_forecast_dates_between")
def test__retrieve_dates_requiring_forecast__finds_db_dates_for_override_period(
        mock_get_forecast_dates_from_db,
        mock_align_date_to_cams_publish
):
    mock_align_date_to_cams_publish.return_value = datetime(2024, 5, 28)
    mock_get_forecast_dates_from_db.return_value = []

    retrieve_dates_requiring_forecast()

    mock_get_forecast_dates_from_db.assert_called_with(
        datetime(2024, 5, 26),
        datetime(2024, 5, 28))


@freeze_time("2024-05-28 02:34:56")
@patch.dict(os.environ, {"FORECAST_RETRIEVAL_PERIOD": "2"})
@patch("etl.src.forecast.forecast_date_retriever.align_to_cams_publish_time")
@patch("etl.src.forecast.forecast_date_retriever.get_forecast_dates_between")
def test__retrieve_dates_requiring_forecast__no_dates_in_db_all_required(
        mock_get_forecast_dates_from_db,
        mock_align_date_to_cams_publish
):
    mock_align_date_to_cams_publish.return_value = datetime(2024, 5, 28)
    mock_get_forecast_dates_from_db.return_value = []

    response = retrieve_dates_requiring_forecast()

    assert len(response) == 5
    assert datetime(2024, 5, 26) in response
    assert datetime(2024, 5, 26, 12) in response
    assert datetime(2024, 5, 27) in response
    assert datetime(2024, 5, 27, 12) in response
    assert datetime(2024, 5, 28) in response


@freeze_time("2024-05-28 02:34:56")
@patch.dict(os.environ, {"FORECAST_RETRIEVAL_PERIOD": "2"})
@patch("etl.src.forecast.forecast_date_retriever.align_to_cams_publish_time")
@patch("etl.src.forecast.forecast_date_retriever.get_forecast_dates_between")
def test__retrieve_dates_requiring_forecast__all_dates_in_db_none_required(
        mock_get_forecast_dates_from_db,
        mock_align_date_to_cams_publish
):
    mock_align_date_to_cams_publish.return_value = datetime(2024, 5, 28)
    mock_get_forecast_dates_from_db.return_value = [
        datetime(2024, 5, 26),
        datetime(2024, 5, 26, 12),
        datetime(2024, 5, 27),
        datetime(2024, 5, 27, 12),
        datetime(2024, 5, 28)
    ]

    response = retrieve_dates_requiring_forecast()

    assert len(response) == 0


@freeze_time("2024-05-28 02:34:56")
@patch.dict(os.environ, {"FORECAST_RETRIEVAL_PERIOD": "2"})
@patch("etl.src.forecast.forecast_date_retriever.align_to_cams_publish_time")
@patch("etl.src.forecast.forecast_date_retriever.get_forecast_dates_between")
def test__retrieve_dates_requiring_forecast__some_dates_in_db_diff_required(
        mock_get_forecast_dates_from_db,
        mock_align_date_to_cams_publish
):
    mock_align_date_to_cams_publish.return_value = datetime(2024, 5, 28)
    mock_get_forecast_dates_from_db.return_value = [
        datetime(2024, 5, 26),
        datetime(2024, 5, 28)
    ]

    response = retrieve_dates_requiring_forecast()

    assert len(response) == 3
    assert datetime(2024, 5, 26, 12) in response
    assert datetime(2024, 5, 27) in response
    assert datetime(2024, 5, 27, 12) in response


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
