import json
import os
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from urllib.parse import parse_qs, urlparse

import pytest

from etl.src.in_situ import openaq_dao
from etl.src.in_situ.openaq_backfill import (
    cache_openaq_chunk,
    chunk_windows,
    to_windows,
)
from etl.src.in_situ.openaq_dao import (
    _call_openaq_api_v3,
    cache_file_path,
    fetch_in_situ_measurements,
)

DATE_FORMAT = "%Y-%m-%dT%H:%M:%SZ"
city = {"name": "London", "latitude": 51.5, "longitude": -0.1, "type": "city"}

locations = [
    {
        "name": "Station A",
        "isMonitor": True,
        "coordinates": {"latitude": 51.51, "longitude": -0.11},
        "datetimeLast": {"utc": "2026-01-20T00:00:00Z"},
        "sensors": [
            {"id": 1, "parameter": {"name": "no2"}},
            {"id": 2, "parameter": {"name": "pm25"}},
            {"id": 3, "parameter": {"name": "co"}},
        ],
    },
    {
        "name": "Station B",
        "isMonitor": False,
        "coordinates": {"latitude": 51.52, "longitude": -0.12},
        # Mid-range, so the cron drops this location for later windows
        "datetimeLast": {"utc": "2026-01-06T10:00:00Z"},
        "sensors": [{"id": 4, "parameter": {"name": "pm10"}}],
    },
    {
        "name": "Station C",
        "isMonitor": True,
        "coordinates": {"latitude": 51.53, "longitude": -0.13},
        "datetimeLast": None,
        "sensors": [{"id": 5, "parameter": {"name": "o3"}}],
    },
]

series_start = datetime(2026, 1, 1)
series_end = datetime(2026, 1, 15)


def _hourly_series(sensor_id: int) -> list[dict]:
    series = []
    hour = series_start
    index = 0
    while hour < series_end:
        if (index + sensor_id) % 11 != 0:  # gaps in the data
            item = {
                "parameter": {"units": "µg/m³"},
                "period": {
                    "datetimeFrom": {"utc": hour.strftime(DATE_FORMAT)},
                    "datetimeTo": {
                        "utc": (hour + timedelta(hours=1)).strftime(DATE_FORMAT),
                        "local": (hour + timedelta(hours=2)).isoformat() + "+01:00",
                    },
                },
                "summary": {"avg": sensor_id * 1000 + index + 0.25},
            }
            if index % 17 == 0:
                item["summary"] = {}  # no average, skipped by the transform
            series.append(item)
        hour += timedelta(hours=1)
        index += 1
    return series


def _fake_openaq(session, url, headers):
    """OpenAQ v3 behaviour as observed on the real API"""
    parsed = urlparse(url)
    params = {key: value[0] for key, value in parse_qs(parsed.query).items()}
    response = Mock()
    if parsed.path.endswith("v3/locations"):
        response.json.return_value = {"results": locations}
        return response

    sensor_id = int(parsed.path.split("/")[-3])
    date_from = datetime.strptime(params["datetime_from"], DATE_FORMAT)
    date_to = datetime.strptime(params["datetime_to"], DATE_FORMAT)
    selected = [
        item
        for item in _hourly_series(sensor_id)
        if datetime.strptime(item["period"]["datetimeFrom"]["utc"], DATE_FORMAT)
        >= date_from
        and datetime.strptime(item["period"]["datetimeTo"]["utc"], DATE_FORMAT)
        <= date_to
    ]
    limit = int(params["limit"])
    page = int(params["page"])
    response.json.return_value = {
        "meta": {"found": len(selected)},
        "results": selected[(page - 1) * limit : page * limit],
    }
    return response


@pytest.fixture
def fake_api():
    with patch(
        "etl.src.in_situ.openaq_dao._make_request", side_effect=_fake_openaq
    ) as mock:
        yield mock


@pytest.fixture
def small_pages():
    with patch.object(openaq_dao, "MEASUREMENTS_PAGE_LIMIT", 30):
        yield


def test__to_windows__matches_cron_windows_and_sorts():
    dates = [datetime(2026, 1, 5, 13), datetime(2026, 1, 4, 13)]
    assert to_windows(dates) == [
        (datetime(2026, 1, 3, 13), datetime(2026, 1, 4, 13)),
        (datetime(2026, 1, 4, 13), datetime(2026, 1, 5, 13)),
    ]


def test__to_windows__overlapping_windows_rejected():
    with pytest.raises(ValueError):
        to_windows([datetime(2026, 1, 5, 13), datetime(2026, 1, 5, 20)])


def test__chunk_windows__limits_span():
    windows = to_windows([datetime(2026, 1, day, 13) for day in range(2, 12)])
    chunks = chunk_windows(windows, chunk_days=3)
    assert [len(chunk) for chunk in chunks] == [3, 3, 3, 1]
    assert [window for chunk in chunks for window in chunk] == windows


@pytest.mark.parametrize("chunk_days", [1, 3, 40])
def test__cache_openaq_chunk__cache_matches_cron_requests_per_window(
    fake_api, small_pages, tmp_path, chunk_days
):
    dates = [
        datetime(2026, 1, 3, 13),
        datetime(2026, 1, 4, 13),
        datetime(2026, 1, 5, 13),
        datetime(2026, 1, 6, 13),
        datetime(2026, 1, 9, 13),  # gap, as when some days are already complete
        datetime(2026, 1, 10, 13),
        datetime(2026, 1, 14, 13),
    ]
    windows = to_windows(dates)

    locations_by_city = {}
    for chunk in chunk_windows(windows, chunk_days):
        cache_openaq_chunk([city], chunk, str(tmp_path), Mock(), locations_by_city)

    for window_start, window_end in windows:
        expected = _call_openaq_api_v3(city, window_start, window_end, Mock())
        path = cache_file_path(str(tmp_path), city["name"], window_start, window_end)
        with open(path, encoding="utf-8") as f:
            cached = json.load(f)
        assert cached == json.loads(json.dumps(expected))

    # Sanity check that the scenario exercises the interesting cases
    first = cache_file_path(str(tmp_path), "London", *windows[0])
    last = cache_file_path(str(tmp_path), "London", *windows[-1])
    with open(first, encoding="utf-8") as f:
        assert {m["location"] for m in json.load(f)} == {"Station A", "Station B"}
    with open(last, encoding="utf-8") as f:
        assert {m["location"] for m in json.load(f)} == {"Station A"}


def test__cache_openaq_chunk__uses_far_fewer_requests(fake_api, tmp_path):
    windows = to_windows([datetime(2026, 1, day, 13) for day in range(2, 15)])
    cache_openaq_chunk([city], windows, str(tmp_path), Mock(), {})

    # 1 locations call + 1 call per supported sensor, instead of per day
    assert fake_api.call_count == 1 + 3


def test__cache_openaq_chunk__existing_cache_files_not_refetched(fake_api, tmp_path):
    windows = to_windows([datetime(2026, 1, 3, 13), datetime(2026, 1, 4, 13)])
    cache_openaq_chunk([city], windows, str(tmp_path), Mock(), {})
    fake_api.reset_mock()

    cache_openaq_chunk([city], windows, str(tmp_path), Mock(), {})

    assert fake_api.call_count == 1  # locations only


def test__cache_openaq_chunk__failure_leaves_no_partial_files(tmp_path):
    def fail_on_measurements(session, url, headers):
        if "measurements" in url:
            raise openaq_dao.requests.exceptions.RequestException("boom")
        return _fake_openaq(session, url, headers)

    windows = to_windows([datetime(2026, 1, 3, 13)])
    with patch(
        "etl.src.in_situ.openaq_dao._make_request", side_effect=fail_on_measurements
    ):
        with pytest.raises(openaq_dao.requests.exceptions.RequestException):
            cache_openaq_chunk([city], windows, str(tmp_path), Mock(), {})

    assert os.listdir(tmp_path) == []


def test__fetch_in_situ_measurements__empty_cache_file_does_not_call_api(
    fake_api, tmp_path
):
    date_from = datetime(2026, 1, 3, 13)
    date_to = datetime(2026, 1, 4, 13)
    with open(
        cache_file_path(str(tmp_path), "London", date_from, date_to),
        "w",
        encoding="utf-8",
    ) as f:
        f.write("[]")

    with patch.dict(os.environ, {"OPEN_AQ_CACHE": str(tmp_path)}):
        result = fetch_in_situ_measurements([city], date_from, date_to)

    assert result["London"]["measurements"] == []
    fake_api.assert_not_called()


def test__fetch_in_situ_measurements__missing_cache_file_calls_api(fake_api, tmp_path):
    date_from = datetime(2026, 1, 3, 13)
    date_to = datetime(2026, 1, 4, 13)

    with patch.dict(os.environ, {"OPEN_AQ_CACHE": str(tmp_path)}):
        result = fetch_in_situ_measurements([city], date_from, date_to)

    assert len(result["London"]["measurements"]) > 0
    assert fake_api.call_count > 0
