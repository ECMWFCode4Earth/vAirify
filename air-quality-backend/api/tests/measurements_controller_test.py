from datetime import datetime
from unittest.mock import patch

from src.types import ApiSource
import pytest
from fastapi.testclient import TestClient

from src.main import app
from shared.src.database.locations import AirQualityLocationType

client = TestClient(app)


def test__measurements_required_query_params__error_if_not_supplied():
    response = client.get("/air-pollutant/measurements", params={})
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "input": None,
                "loc": ["query", "date_from"],
                "msg": "Field required",
                "type": "missing",
            },
            {
                "input": None,
                "loc": ["query", "date_to"],
                "msg": "Field required",
                "type": "missing",
            },
            {
                "input": None,
                "loc": ["query", "location_type"],
                "msg": "Field required",
                "type": "missing",
            },
        ]
    }


measurement_request_defaults = {
    "date_from": "2024-06-01T00:00:00",
    "date_to": "2024-06-01T00:00:00",
    "location_type": "city",
}


@pytest.mark.parametrize(
    "field, params, expected_msg",
    [
        # date_from invalid
        (
            "date_from",
            {
                **measurement_request_defaults,
                "date_from": "2024-06-01T",
            },
            "Input should be a valid datetime or date, "
            + "unexpected extra characters at the end of the input",
        ),
        # date_to invalid
        (
            "date_to",
            {
                **measurement_request_defaults,
                "date_to": "2024-06-01T",
            },
            "Input should be a valid datetime or date, "
            + "unexpected extra characters at the end of the input",
        ),
        # location_type invalid
        (
            "location_type",
            {
                **measurement_request_defaults,
                "location_type": "town",
            },
            "Input should be 'city'",
        ),
    ],
)
def test__measurements_invalid_query_params__throw_error(field, params, expected_msg):
    response = client.get("/air-pollutant/measurements", params=params)
    assert response.status_code == 422
    assert len(response.json()["detail"]) == 1
    assert response.json()["detail"][0]["msg"] == expected_msg


def test__measurements_applies_appropriate_filters__when_request_valid():
    params = {
        **measurement_request_defaults,
        "location_names": ["London", "Paris"],
        "api_source": "OpenAQ",
    }
    with patch(
        "src.measurements_controller.find_by_criteria", return_value=[]
    ) as mock_find_criteria:
        response = client.get("/air-pollutant/measurements", params=params)
        assert response.status_code == 200
        assert response.json() == []
        mock_find_criteria.assert_called_with(
            datetime(2024, 6, 1, 0, 0),
            datetime(2024, 6, 1, 0, 0),
            AirQualityLocationType.CITY,
            ["London", "Paris"],
            ApiSource.OPENAQ,
        )


def test__summary_required_query_params__error_if_not_supplied():
    response = client.get("/air-pollutant/measurements/summary", params={})
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "input": None,
                "loc": ["query", "measurement_base_time"],
                "msg": "Field required",
                "type": "missing",
            },
            {
                "input": None,
                "loc": ["query", "measurement_time_range"],
                "msg": "Field required",
                "type": "missing",
            },
            {
                "input": None,
                "loc": ["query", "location_type"],
                "msg": "Field required",
                "type": "missing",
            },
        ]
    }


summary_request_defaults = {
    "measurement_base_time": "2024-06-01T00:00:00",
    "measurement_time_range": "90",
    "location_type": "city",
}


@pytest.mark.parametrize(
    "field, params, expected_msg",
    [
        # measurement_base_time invalid
        (
            "measurement_base_time",
            {
                **summary_request_defaults,
                "measurement_base_time": "2024-06-01T",
            },
            "Input should be a valid datetime or date, "
            + "unexpected extra characters at the end of the input",
        ),
        # location_type invalid
        (
            "location_type",
            {
                **summary_request_defaults,
                "location_type": "town",
            },
            "Input should be 'city'",
        ),
    ],
)
def test__summary_invalid_query_params__throw_error(field, params, expected_msg):
    response = client.get("/air-pollutant/measurements/summary", params=params)
    assert response.status_code == 422
    assert len(response.json()["detail"]) == 1
    assert response.json()["detail"][0]["msg"] == expected_msg


def test__summary_applies_appropriate_filters__when_request_valid():
    with patch(
        "src.measurements_controller.get_averaged", return_value=[]
    ) as mock_get_averaged:
        response = client.get(
            "/air-pollutant/measurements/summary", params=summary_request_defaults
        )
        assert response.status_code == 200
        assert response.json() == []
        mock_get_averaged.assert_called_with(
            datetime(2024, 6, 1, 0, 0),
            90,
            AirQualityLocationType.CITY,
        )
