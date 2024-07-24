from datetime import datetime, timezone, UTC
from unittest.mock import patch

from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)

default_request_params = {
    "base_time": "2024-05-27T12:00:00.000+00:00",
}


def test__get_data_texture__no_results():
    with patch(
        "src.texture_controller.get_data_textures_from_database",
        return_value=[],
    ) as mock_fetch_data:
        response = client.get(
            "/air-pollutant/data_textures",
            params=default_request_params)
        assert response.status_code == 404
        assert response.json() == {}
        mock_fetch_data.assert_called_once_with(
            datetime(2024, 5, 27, 12, tzinfo=timezone.utc),
        )


def test__required_query_params__error_if_not_supplied():
    response = client.get("/air-pollutant/data_textures", params={})
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Field required"


def test__get_data_texture__with_results():
    mock_db_results = [
        {
            'time_start': datetime(2024, 7, 24, 0, 0),
            'source': 'cams-production',
            'forecast_base_time': datetime(2024, 7, 24, 1, 0).astimezone(UTC),
            'variable': 'no2',
            'time_end': datetime(2024, 7, 25, 21, 0),
            'chunk': '1 of 3',
            'max_value': 100.0,
            'min_value': 0.0,
            'texture_uri': '/app/data_textures/2024-07-24_00/no2_2024-07-24_00_CAMS',
            'units': 'kg m**-3 * 1e-9',
        },
        {
            'time_start': datetime(2024, 7, 24, 0, 0),
            'forecast_base_time': datetime(2024, 7, 24, 1, 0).astimezone(UTC),
            'source': 'cams-production',
            'variable': 'o3',
            'time_end': datetime(2024, 7, 25, 21, 0),
            'chunk': '1 of 3',
            'max_value': 500.0,
            'min_value': 0.0,
            'texture_uri': '/app/data_textures/2024-07-24_00/o3_2024-07-24_00_CAMS',
            'units': 'kg m**-3 * 1e-9',
        },
    ]
    mock_results = [
        {
            "base_time": "2024-07-24T00:00:00Z",
            "variable": "no2",
            "time_start": "2024-07-24T00:00:00",
            "time_end": "2024-07-25T21:00:00",
            "chunk": "1 of 3",
            "source": "cams-production",
            "texture_uri": "/2024-07-24_00/no2_2024-07-24_00_CAMS",
            "min_value": 0.0,
            "max_value": 100.0
        },
        {
            "base_time": "2024-07-24T00:00:00Z",
            "variable": "o3",
            "time_start": "2024-07-24T00:00:00",
            "time_end": "2024-07-25T21:00:00",
            "chunk": "1 of 3",
            "source": "cams-production",
            "texture_uri": "/2024-07-24_00/o3_2024-07-24_00_CAMS",
            "min_value": 0.0,
            "max_value": 500.0
        },
    ]
    with patch(
        "src.texture_controller.get_data_textures_from_database",
        return_value=mock_db_results,
    ) as mock_fetch_data:
        response = client.get(
            "/air-pollutant/data_textures",
            params=default_request_params)
        assert response.status_code == 200
        assert response.json() == mock_results

        mock_fetch_data.assert_called_once_with(
            datetime(2024, 5, 27, 12, tzinfo=timezone.utc),
        )


def test__get_data_texture__exception_handling():
    with patch(
        "src.texture_controller.get_data_textures_from_database",
        side_effect=Exception("Database error"),
    ) as mock_fetch_data:
        response = client.get(
            "/air-pollutant/data_textures",
            params=default_request_params)
        assert response.status_code == 500
        assert response.json() == {"detail": "Internal Server Error"}
        mock_fetch_data.assert_called_once_with(
            datetime(2024, 5, 27, 12, tzinfo=timezone.utc),
        )
