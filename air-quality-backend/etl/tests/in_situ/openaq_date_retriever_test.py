import os
from datetime import datetime, timedelta
from unittest.mock import patch

import pytest
from freezegun import freeze_time

from etl.src.in_situ.openaq_date_retriever import retrieve_dates_requiring_in_situ_data


@patch.dict(os.environ, {"IN_SITU_RETRIEVAL_PERIOD": "invalid"})
def test__retrieve_dates_requiring_in_situ_data__invalid_period_raises_error():
    with pytest.raises(ValueError):
        retrieve_dates_requiring_in_situ_data()


@pytest.mark.parametrize("retrieval_period", ["-1", "0", "1"],)
@freeze_time("2024-08-07T12:34:56")
def test__retrieve_dates_requiring_in_situ_data__no_extra_dates_required(
        retrieval_period):
    with patch.dict(os.environ, {"IN_SITU_RETRIEVAL_PERIOD": retrieval_period}):
        result = retrieve_dates_requiring_in_situ_data()

        assert len(result) == 1
        assert result[0] == datetime(2024, 8, 7, 12, 34, 56)


@patch.dict(os.environ, {"IN_SITU_RETRIEVAL_PERIOD": "2"})
@patch("etl.src.in_situ.openaq_date_retriever.get_in_situ_dates_between")
@freeze_time("2024-08-07T12:34:56")
def test__retrieve_dates_requiring_in_situ_data__one_extra_date_without_gap(
        patch_db_get):
    patch_db_get.return_value = [
        datetime(2024, 8, 6, 12, 34, 56) - timedelta(hours=i + 1) for i in range(23)]

    result = retrieve_dates_requiring_in_situ_data()

    patch_db_get.assert_called_with(
        datetime(2024, 8, 5, 12, 34, 56),
        datetime(2024, 8, 6, 12, 34, 56))

    assert len(result) == 1
    assert result[0] == datetime(2024, 8, 7, 12, 34, 56)


@patch.dict(os.environ, {"IN_SITU_RETRIEVAL_PERIOD": "2"})
@patch("etl.src.in_situ.openaq_date_retriever.get_in_situ_dates_between")
@freeze_time("2024-08-07T12:34:56")
def test__retrieve_dates_requiring_in_situ_data__one_extra_date_with_gaps(
        patch_db_get):
    patch_db_get.return_value = [
        datetime(2024, 8, 6, 12, 34, 56) - timedelta(hours=i + 1) for i in range(20)]

    result = retrieve_dates_requiring_in_situ_data()

    patch_db_get.assert_called_with(
        datetime(2024, 8, 5, 12, 34, 56),
        datetime(2024, 8, 6, 12, 34, 56))

    assert len(result) == 2
    assert result[0] == datetime(2024, 8, 6, 12, 34, 56)
    assert result[1] == datetime(2024, 8, 7, 12, 34, 56)


@patch.dict(os.environ, {"IN_SITU_RETRIEVAL_PERIOD": "3"})
@patch("etl.src.in_situ.openaq_date_retriever.get_in_situ_dates_between")
@freeze_time("2024-08-07T12:34:56")
def test__retrieve_dates_requiring_in_situ_data__two_extra_dates_one_with_gap(
        patch_db_get):
    patch_db_get.return_value = [
        datetime(2024, 8, 6, 12, 34, 56) - timedelta(hours=i + 1) for i in range(30)]

    result = retrieve_dates_requiring_in_situ_data()

    patch_db_get.assert_called_with(
        datetime(2024, 8, 4, 12, 34, 56),
        datetime(2024, 8, 6, 12, 34, 56))

    assert len(result) == 2
    assert result[0] == datetime(2024, 8, 5, 12, 34, 56)
    assert result[1] == datetime(2024, 8, 7, 12, 34, 56)
