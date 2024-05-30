import mongomock
from fastapi.testclient import TestClient

from air_quality.api.main import app
from tests.database.forecast_database_test_data import forecast_from_database

client = TestClient(app)


def test_get_forecast_data_no_city_name(mocker):
    database_client_mock = mongomock.MongoClient().db.collection
    database_client_mock.insert_many(forecast_from_database)
    mocker.patch(
        "src.air_quality.database.forecasts.get_collection",
        return_value=database_client_mock,
    )

    valid_date_from = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    location_type = "city"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 200


def test_get_forecast_data_with_city_name(mocker):
    database_client_mock = mongomock.MongoClient().db.collection
    database_client_mock.insert_many(forecast_from_database)
    mocker.patch(
        "src.air_quality.database.forecasts.get_collection",
        return_value=database_client_mock,
    )

    valid_date_from = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    location_type = "city"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 200


def test_get_forecast_data_incorrect_valid_date_from():
    valid_date_from = "2023A00.000%2B00%3A00"
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    location_type = "city"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": "Incorrect data format, should be %Y-%m-%dT%H:%M:%S.%f%z"
    }


def test_get_forecast_data_incorrect_valid_date_to():
    valid_date_from = "2024-05-27T00%3A00%3A00.000%2B00%3A00"
    valid_date_to = "2024-%3A00.000%2B00%3A00"
    location_type = "city"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": "Incorrect data format, should be %Y-%m-%dT%H:%M:%S.%f%z"
    }


def test_get_forecast_data_incorrect_forecast_base_time():
    valid_date_from = "2024-05-27T00%3A00%3A00.000%2B00%3A00"
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    location_type = "city"
    forecast_base_time = "%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": "Incorrect data format, should be %Y-%m-%dT%H:%M:%S.%f%z"
    }


def test_get_forecast_data_no_valid_date_from():
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    location_type = "city"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?"
        "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "input": None,
                "loc": ["query", "valid_date_from"],
                "msg": "Field required",
                "type": "missing",
            }
        ]
    }


def test_get_forecast_data_no_valid_date_to():
    valid_date_from = "2024-05-27T00%3A00%3A00.000%2B00%3A00"
    location_type = "city"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "input": None,
                "loc": ["query", "valid_date_to"],
                "msg": "Field required",
                "type": "missing",
            }
        ]
    }


def test_get_forecast_data_no_forecast_base_time():
    valid_date_from = "2024-05-27T00%3A00%3A00.000%2B00%3A00"
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    location_type = "city"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "input": None,
                "loc": ["query", "forecast_base_time"],
                "msg": "Field required",
                "type": "missing",
            }
        ]
    }


def test_get_forecast_data_incorrect_location_type():
    valid_date_from = "2024-05-27T00%3A00%3A00.000%2B00%3A00"
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    location_type = "not a city"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&location_type="
        + location_type
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {"detail": "Incorrect location type"}


def test_get_forecast_data_no_location_type():
    valid_date_from = "2024-05-27T00%3A00%3A00.000%2B00%3A00"
    valid_date_to = "2024-05-27T23%3A00%3A00.000%2B00%3A00"
    forecast_base_time = "2024-05-27T12%3A00%3A00.000%2B00%3A00"
    name = "Abu%20Dhabi"
    response = client.get(
        "/air-pollutant-forecast?valid_date_from="
        + valid_date_from
        + "&valid_date_to="
        + valid_date_to
        + "&forecast_base_time="
        + forecast_base_time
        + "&location_name="
        + name
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "input": None,
                "loc": ["query", "location_type"],
                "msg": "Field required",
                "type": "missing",
            }
        ]
    }
