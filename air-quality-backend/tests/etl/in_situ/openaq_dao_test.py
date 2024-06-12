from datetime import datetime
from unittest.mock import patch, Mock

from air_quality.etl.in_situ.openaq_dao import fetch_in_situ_measurements, base_url

date_from = datetime(2023, 12, 25, 7, 30)
date_to = datetime(2023, 12, 25, 7, 30)


def test__fetch_in_situ_measurements__no_cities_returns_empty():
    cities = []
    result = fetch_in_situ_measurements(cities, date_from, date_to)

    assert result == {}


@patch("air_quality.etl.in_situ.openaq_dao.urlencode")
@patch("air_quality.etl.in_situ.openaq_dao.requests")
def test__fetch_in_situ_measurements__correct_url_params_encoded(
    requests_patch, urlencode_patch
):
    response_mock = Mock()
    response_mock.json.return_value = {"results": []}
    requests_patch.get.return_value = response_mock

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
@patch("air_quality.etl.in_situ.openaq_dao.requests")
@patch("air_quality.etl.in_situ.openaq_dao.os")
def test__fetch_in_situ_measurements__correct_url_called(
    os_patch, requests_patch, urlencode_patch
):
    urlencode_patch.return_value = "test_url_params"
    os_patch.environ.get.return_value = "test_api_key"
    response_mock = Mock()
    response_mock.json.return_value = {"results": []}
    requests_patch.get.return_value = response_mock

    cities = [{"name": "London", "latitude": 11, "longitude": 22}]
    fetch_in_situ_measurements(cities, date_from, date_to)

    requests_patch.get.assert_called_with(
        f"{base_url}?test_url_params", headers={"X-API-Key": "test_api_key"}
    )


@patch("air_quality.etl.in_situ.openaq_dao.requests")
def test__fetch_in_situ_measurements__single_city_without_measurements(requests_patch):
    response_mock = Mock()
    response_mock.json.return_value = {"results": []}
    requests_patch.get.return_value = response_mock

    cities = [{"name": "London", "latitude": 11, "longitude": 22}]
    result = fetch_in_situ_measurements(cities, date_from, date_to)

    assert result["London"]["city"] == cities[0]
    assert result["London"]["measurements"] == []


@patch("air_quality.etl.in_situ.openaq_dao.requests")
def test__fetch_in_situ_measurements__single_city_multiple_measurements(requests_patch):
    response_mock = Mock()
    response_mock.json.return_value = {"results": [100, 200]}
    requests_patch.get.return_value = response_mock

    cities = [{"name": "London", "latitude": 11, "longitude": 22}]
    result = fetch_in_situ_measurements(cities, date_from, date_to)

    assert result["London"]["city"] == cities[0]
    assert result["London"]["measurements"] == [100, 200]


@patch("air_quality.etl.in_situ.openaq_dao.requests")
def test__fetch_in_situ_measurements__single_city_too_many_measurements(requests_patch):
    response_mock = Mock()

    results = range(0, 3001)
    response_mock.json.return_value = {"results": results}
    requests_patch.get.return_value = response_mock

    cities = [{"name": "London", "latitude": 11, "longitude": 22}]
    result = fetch_in_situ_measurements(cities, date_from, date_to)

    assert result["London"]["city"] == cities[0]
    assert result["London"]["measurements"] == results


@patch("air_quality.etl.in_situ.openaq_dao.requests")
def test__fetch_in_situ_measurements__multiple_cities(requests_patch):
    response_mock = Mock()
    response_mock.json.return_value = {}
    requests_patch.get.return_value = response_mock

    cities = [
        {"name": "London", "latitude": 11, "longitude": 22},
        {"name": "Dublin", "latitude": 33, "longitude": 44},
    ]
    result = fetch_in_situ_measurements(cities, date_from, date_to)

    assert result["London"]["city"] == cities[0]
    assert result["Dublin"]["city"] == cities[1]
