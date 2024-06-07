from datetime import datetime, timezone

from air_quality.api.mappers.forecast_mapper import map_forecast
from tests.api.mappers.create_mock_forecast_document import (
    create_mock_forecast_document,
)


def test_map_forecast_database_data_to_api_output_data():
    result = map_forecast(
        [create_mock_forecast_document({}), create_mock_forecast_document({})]
    )
    assert result == [
        {
            "base_time": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
            "location_name": "Location",
            "location_type": "city",
            "no2": {"aqi_level": 0, "value": 0.0},
            "o3": {"aqi_level": 0, "value": 0.0},
            "overall_aqi_level": 0,
            "pm10": {"aqi_level": 0, "value": 0.0},
            "pm2_5": {"aqi_level": 0, "value": 0.0},
            "so2": {"aqi_level": 0, "value": 0.0},
            "valid_date": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
        },
        {
            "base_time": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
            "location_name": "Location",
            "location_type": "city",
            "no2": {"aqi_level": 0, "value": 0.0},
            "o3": {"aqi_level": 0, "value": 0.0},
            "overall_aqi_level": 0,
            "pm10": {"aqi_level": 0, "value": 0.0},
            "pm2_5": {"aqi_level": 0, "value": 0.0},
            "so2": {"aqi_level": 0, "value": 0.0},
            "valid_date": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
        },
    ]
