from datetime import datetime, timezone

from src.mappers.forecast_mapper import map_forecast
from shared.tests.util.mock_forecast_data import create_mock_forecast_document


def test__map_forecast_database_data_to_api_output_data():
    result = map_forecast(
        [
            create_mock_forecast_document({"name": "123"}),
            create_mock_forecast_document({"name": "456"}),
        ]
    )
    expected = {
        "base_time": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
        "location_type": "city",
        "overall_aqi_level": 1,
        "o3": {"aqi_level": 1, "value": 1.0},
        "no2": {"aqi_level": 1, "value": 2.0},
        "so2": {"aqi_level": 1, "value": 3.0},
        "pm10": {"aqi_level": 2, "value": 4.0},
        "pm2_5": {"aqi_level": 2, "value": 5.0},
        "valid_time": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
    }
    assert result == [
        {**expected, "location_name": "123"},
        {**expected, "location_name": "456"},
    ]
