import os
import re
from datetime import datetime
from unittest import mock
from unittest.mock import patch, Mock, mock_open

import pytest
from pytest_httpserver import HTTPServer

from air_quality.etl.in_situ.openaq_dao import (
    fetch_in_situ_measurements,
    measurements_path,
)

date_from = datetime(2023, 12, 25, 7, 30)
date_to = datetime(2023, 12, 25, 7, 30)


def test__fetch_in_situ_measurements__no_cities_returns_empty():
    cities = []
    result = fetch_in_situ_measurements(cities, date_from, date_to)

    assert result == {}


@patch("air_quality.etl.in_situ.openaq_dao.urlencode")
@patch("air_quality.etl.in_situ.openaq_dao.requests.Session.get")
def test__fetch_in_situ_measurements__correct_url_params_encoded(
    requests_patch, urlencode_patch
):
    response_mock = Mock()
    response_mock.json.return_value = {"results": []}
    requests_patch.return_value = response_mock

    cities = [{"name": "London", "latitude": 11, "longitude": 22}]
    fetch_in_situ_measurements(cities, date_from, date_to)

    urlencode_patch.assert_called_with(
        {
            "limit": 3000,
            "page": "1",
            "offset": "0",
            "sort": "desc",
            "order_by": "datetime",
            "radius": "25000",
            "date_to": date_to.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "date_from": date_from.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "coordinates": "11,22",
            "parameter": ["o3", "no2", "pm10", "so2", "pm25"],
        },
        doseq=True,
    )


@patch("air_quality.etl.in_situ.openaq_dao.urlencode")
@patch("air_quality.etl.in_situ.openaq_dao.requests.Session.get")
@mock.patch.dict(
    os.environ,
    {"OPEN_AQ_API_URL": "test_url", "OPEN_AQ_API_KEY": "test_api_key"},
)
def test__fetch_in_situ_measurements__correct_url_called(
    requests_patch, urlencode_patch
):
    urlencode_patch.return_value = "test_url_params"
    response_mock = Mock()
    response_mock.json.return_value = {"results": []}
    requests_patch.return_value = response_mock

    cities = [{"name": "London", "latitude": 11, "longitude": 22}]
    fetch_in_situ_measurements(cities, date_from, date_to)

    requests_patch.assert_called_with(
        f"test_url/{measurements_path}?test_url_params",
        headers={"X-API-Key": "test_api_key"},
    )


@patch("air_quality.etl.in_situ.openaq_dao.requests.Session.get")
def test__fetch_in_situ_measurements__single_city_without_measurements(requests_patch):
    response_mock = Mock()
    response_mock.json.return_value = {"results": []}
    requests_patch.return_value = response_mock

    cities = [{"name": "London", "latitude": 11, "longitude": 22}]
    result = fetch_in_situ_measurements(cities, date_from, date_to)

    assert result["London"]["city"] == cities[0]
    assert result["London"]["measurements"] == []


@patch("air_quality.etl.in_situ.openaq_dao.requests.Session.get")
def test__fetch_in_situ_measurements__single_city_multiple_measurements(requests_patch):
    response_mock = Mock()
    response_mock.json.return_value = {"results": [100, 200]}
    requests_patch.return_value = response_mock

    cities = [{"name": "London", "latitude": 11, "longitude": 22}]
    result = fetch_in_situ_measurements(cities, date_from, date_to)

    assert result["London"]["city"] == cities[0]
    assert result["London"]["measurements"] == [100, 200]


@patch("air_quality.etl.in_situ.openaq_dao.requests.Session.get")
def test__fetch_in_situ_measurements__single_city_too_many_measurements(requests_patch):
    response_mock = Mock()

    results = range(0, 3001)
    response_mock.json.return_value = {"results": results}
    requests_patch.return_value = response_mock

    cities = [{"name": "London", "latitude": 11, "longitude": 22}]
    result = fetch_in_situ_measurements(cities, date_from, date_to)

    assert result["London"]["city"] == cities[0]
    assert result["London"]["measurements"] == results


@patch("air_quality.etl.in_situ.openaq_dao.requests.Session.get")
def test__fetch_in_situ_measurements__multiple_cities(requests_patch):
    response_mock = Mock()
    response_mock.json.return_value = {"results": []}
    requests_patch.return_value = response_mock

    cities = [
        {"name": "London", "latitude": 11, "longitude": 22},
        {"name": "Dublin", "latitude": 33, "longitude": 44},
    ]
    result = fetch_in_situ_measurements(cities, date_from, date_to)

    assert result["London"]["city"] == cities[0]
    assert result["Dublin"]["city"] == cities[1]


@patch("json.load")
@patch("os.path.exists")
@patch.dict(os.environ, {"OPEN_AQ_CACHE": "test_cache"})
def test__fetch_in_situ_measurements__cache_supplied_reads_from_cache(
    mock_path_exists, mock_json_load
):
    with patch("builtins.open", new_callable=mock_open, read_data="data"):
        mock_path_exists.return_value = True
        mock_json_load.return_value = {"test_key": "test_value"}

        date_from_str = date_from.strftime("%Y%m%d%H")
        date_to_str = date_to.strftime("%Y%m%d%H")
        expected_file_name = f"test_cache/London_{date_from_str}_{date_to_str}.json"

        cities = [{"name": "London", "latitude": 11, "longitude": 22}]
        result = fetch_in_situ_measurements(cities, date_from, date_to)

        assert result["London"]["city"] == cities[0]
        assert result["London"]["measurements"] == {"test_key": "test_value"}
        mock_path_exists.assert_called_with(expected_file_name)


@patch("air_quality.etl.in_situ.openaq_dao.requests.Session.get")
@patch("os.path.exists")
@patch.dict(os.environ, {"OPEN_AQ_CACHE": "test_cache"})
def test__fetch_in_situ_measurements__cache_supplied_but_no_file_for_city_calls_api(
    mock_path_exists, requests_patch
):
    mock_path_exists.return_value = False
    response_mock = Mock()
    response_mock.json.return_value = {"results": [100, 200]}
    requests_patch.return_value = response_mock

    cities = [{"name": "London", "latitude": 11, "longitude": 22}]
    result = fetch_in_situ_measurements(cities, date_from, date_to)

    assert result["London"]["city"] == cities[0]
    assert result["London"]["measurements"] == [100, 200]

    date_from_str = date_from.strftime("%Y%m%d%H")
    date_to_str = date_to.strftime("%Y%m%d%H")
    expected_file_name = f"test_cache/London_{date_from_str}_{date_to_str}.json"
    mock_path_exists.assert_called_with(expected_file_name)


@pytest.fixture(scope="session")
def httpserver_listen_address():
    return "127.0.0.1", 9999


@mock.patch.dict(
    os.environ,
    {
        "OPEN_AQ_API_URL": "http://localhost:9999",
    },
)
def test__fetch_in_situ_measurements__retries_408_responses(httpserver: HTTPServer):
    expected_retries = 2
    for index in range(expected_retries):
        httpserver.expect_ordered_request(
            re.compile("^/v2/measurements"), method="GET"
        ).respond_with_data("{}", status=408, content_type="application/json")
    httpserver.expect_ordered_request(
        re.compile("^/v2/measurements"), method="GET"
    ).respond_with_json({"results": [123]})

    cities = [{"name": "London", "latitude": 11, "longitude": 22}]
    result = fetch_in_situ_measurements(cities, date_from, date_to)
    assert result["London"]["city"] == cities[0]
    assert result["London"]["measurements"] == [123]
