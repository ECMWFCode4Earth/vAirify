from datetime import datetime
from unittest.mock import patch

import pytest
from freezegun import freeze_time

from etl.src.forecast.forecast_date_retriever import align_to_cams_publish_time, \
    retrieve_dates_requiring_forecast


@freeze_time("2024-05-28 02:34:56")
@patch("etl.src.forecast.forecast_date_retriever.align_to_cams_publish_time")
def test__retrieve_dates_requiring_forecast__default_date_range_correct(mock_align):
    mock_align.return_value = datetime(2024, 5, 28)

    dates_resp = retrieve_dates_requiring_forecast()
    assert len(dates_resp) == 1


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