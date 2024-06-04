from datetime import datetime
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from air_quality.api.main import app
from air_quality.database.locations import AirQualityLocationType

client = TestClient(app)


def test__required_query_params__error_if_not_supplied():
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


request_defaults = {
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
                **request_defaults,
                "date_from": "2024-06-01T",
            },
            "Input should be a valid datetime or date, "
            + "unexpected extra characters at the end of the input",
        ),
        # date_to invalid
        (
            "date_to",
            {
                **request_defaults,
                "date_to": "2024-06-01T",
            },
            "Input should be a valid datetime or date, "
            + "unexpected extra characters at the end of the input",
        ),
        # location_type invalid
        (
            "location_type",
            {
                **request_defaults,
                "location_type": "town",
            },
            "Input should be 'city'",
        ),
    ],
)
def test__invalid_query_params__throw_error(field, params, expected_msg):
    response = client.get("/air-pollutant/measurements", params=params)
    assert response.status_code == 422
    assert len(response.json()["detail"]) == 1
    assert response.json()["detail"][0]["msg"] == expected_msg


def test__applies_appropriate_filters__when_request_valid():
    params = {
        **request_defaults,
        "location_names": ["London", "Paris"],
        "api_source": "test",
    }
    with patch(
        "air_quality.api.measurements_controller.find_by_criteria", return_value=[]
    ) as mock_find_criteria:
        response = client.get("/air-pollutant/measurements", params=params)
        assert response.status_code == 200
        assert response.json() == []
        mock_find_criteria.assert_called_with(
            datetime(2024, 6, 1, 0, 0),
            datetime(2024, 6, 1, 0, 0),
            AirQualityLocationType.CITY,
            ["London", "Paris"],
            "test",
        )
