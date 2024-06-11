from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from air_quality.api.main import app

client = TestClient(app)


default_request_params = {
    "valid_date_from": "2024-05-27T12:00:00.000+00:00",
    "valid_date_to": "2024-05-27T23:00:00.000+00:00",
    "location_type": "city",
    "forecast_base_time": "2024-05-27T12:00:00.000+00:00",
}


def test__get_forecast_data__no_city_name():
    with patch(
        "air_quality.api.forecast_controller.get_forecast_data_from_database",
        return_value=[],
    ) as mock_fetch_data:
        response = client.get("/air-pollutant/forecast", params=default_request_params)
        assert response.status_code == 200
        assert response.json() == []
        mock_fetch_data.assert_called_with(
            datetime(2024, 5, 27, 12, tzinfo=timezone.utc),
            datetime(2024, 5, 27, 23, tzinfo=timezone.utc),
            "city",
            datetime(2024, 5, 27, 12, tzinfo=timezone.utc),
            None,
        )


def test__get_forecast_data__with_city_name():
    with patch(
        "air_quality.api.forecast_controller.get_forecast_data_from_database",
        return_value=[],
    ) as mock_fetch_data:
        params = {**default_request_params, "location_name": "Test City"}
        response = client.get("/air-pollutant/forecast", params=params)
        assert response.status_code == 200
        assert response.json() == []
        mock_fetch_data.assert_called_with(
            datetime(2024, 5, 27, 12, tzinfo=timezone.utc),
            datetime(2024, 5, 27, 23, tzinfo=timezone.utc),
            "city",
            datetime(2024, 5, 27, 12, tzinfo=timezone.utc),
            "Test City",
        )


def test__required_query_params__error_if_not_supplied():
    required_fields = [
        "location_type",
        "valid_date_from",
        "valid_date_to",
        "forecast_base_time",
    ]
    response = client.get("/air-pollutant/forecast", params={})
    expected_response_message_schema = {
        "input": None,
        "loc": [],
        "msg": "Field required",
        "type": "missing",
    }
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {**expected_response_message_schema, "loc": ["query", field]}
            for field in required_fields
        ]
    }


@pytest.mark.parametrize(
    "field, params, expected_msg",
    [
        # valid_date_from invalid
        (
            "valid_date_from",
            {
                **default_request_params,
                "valid_date_from": "2024-06-01T",
            },
            "Input should be a valid datetime or date, "
            + "unexpected extra characters at the end of the input",
        ),
        # valid_date_to invalid
        (
            "valid_date_to",
            {
                **default_request_params,
                "valid_date_to": "2024-06-01T",
            },
            "Input should be a valid datetime or date, "
            + "unexpected extra characters at the end of the input",
        ),
        # location_type invalid
        (
            "location_type",
            {
                **default_request_params,
                "location_type": "town",
            },
            "Input should be 'city'",
        ),
        # forecast_base_time invalid
        (
            "forecast_base_time",
            {
                **default_request_params,
                "forecast_base_time": "2024-06-01T",
            },
            "Input should be a valid datetime or date, "
            + "unexpected extra characters at the end of the input",
        ),
    ],
)
def test__invalid_query_params__throw_error(field, params, expected_msg):
    response = client.get("/air-pollutant/forecast", params=params)
    assert response.status_code == 422
    assert len(response.json()["detail"]) == 1
    assert response.json()["detail"][0]["msg"] == expected_msg
