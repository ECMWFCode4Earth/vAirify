import json
import os
from datetime import datetime
from unittest.mock import patch

import pytest

from etl.scripts import run_in_situ_backfill
from etl.src.in_situ.openaq_dao import cache_file_path, rate_limiter
from etl.tests.in_situ.openaq_backfill_test import _fake_openaq, city

dates = [
    datetime(2026, 1, 3, 13),
    datetime(2026, 1, 4, 13),
    datetime(2026, 1, 9, 13),
]


@pytest.fixture(autouse=True)
def restore_rate_limiter():
    yield
    rate_limiter.min_interval_seconds = 0.0
    rate_limiter.max_rate_limit_retries = 3


@pytest.fixture
def backfill_env(tmp_path):
    with patch.dict(
        os.environ,
        {
            "IN_SITU_BACKFILL_DIR": str(tmp_path),
            "IN_SITU_BACKFILL_CHUNK_DAYS": "2",
            "OPEN_AQ_MIN_REQUEST_INTERVAL": "0",
        },
    ), patch(
        "etl.src.in_situ.openaq_dao._make_request", side_effect=_fake_openaq
    ), patch(
        "etl.scripts.run_in_situ_backfill.get_cities", return_value=[city]
    ):
        yield tmp_path


@patch("etl.scripts.run_in_situ_backfill.retrieve_dates_requiring_in_situ_data")
@patch("etl.scripts.run_in_situ_backfill.process_in_situ_date")
def test__backfill__processes_every_window_from_cache_with_cron_pipeline(
    mock_process, mock_dates, backfill_env
):
    mock_dates.return_value = dates

    def assert_cache_ready(cities, date):
        assert os.environ["OPEN_AQ_CACHE"] == str(backfill_env)
        window_start = date.replace(day=date.day - 1)
        assert os.path.exists(
            cache_file_path(str(backfill_env), "London", window_start, date)
        )

    mock_process.side_effect = assert_cache_ready

    run_in_situ_backfill.main()

    assert [call.args for call in mock_process.call_args_list] == [
        ([city], date) for date in dates
    ]
    assert os.listdir(backfill_env) == []  # cache and state cleaned up


@patch("etl.scripts.run_in_situ_backfill.retrieve_dates_requiring_in_situ_data")
@patch("etl.scripts.run_in_situ_backfill.process_in_situ_date")
def test__backfill__resumes_with_saved_windows_and_skips_processed(
    mock_process, mock_dates, backfill_env
):
    with open(backfill_env / "backfill_dates.json", "w", encoding="utf-8") as f:
        json.dump([date.isoformat() for date in dates], f)
    with open(backfill_env / "processed_dates.txt", "w", encoding="utf-8") as f:
        f.write(f"{dates[0].isoformat()}\n")

    run_in_situ_backfill.main()

    mock_dates.assert_not_called()
    assert [call.args[1] for call in mock_process.call_args_list] == dates[1:]


@patch("etl.scripts.run_in_situ_backfill.retrieve_dates_requiring_in_situ_data")
@patch("etl.scripts.run_in_situ_backfill.process_in_situ_date")
def test__backfill__failure_keeps_progress_for_resume(
    mock_process, mock_dates, backfill_env
):
    mock_dates.return_value = dates
    mock_process.side_effect = [None, RuntimeError("CAMS unavailable")]

    with pytest.raises(RuntimeError):
        run_in_situ_backfill.main()

    with open(backfill_env / "processed_dates.txt", encoding="utf-8") as f:
        assert f.read().split() == [dates[0].isoformat()]
    assert (backfill_env / "backfill_dates.json").exists()
