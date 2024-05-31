from datetime import datetime, timezone

from src.air_quality.api.mappers.forecast_mapper import map_forecast
from tests.api.mappers.forecast_mapper_test_data import (
    forecast_from_database_for_mapper,
)


def test_map_forecast_database_data_to_api_output_data():
    result = map_forecast(forecast_from_database_for_mapper)
    assert result == [
        {
            "base_time": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
            "location_name": "Abidjan",
            "location_type": "city",
            "no2": {"aqi_level": 1, "value": 0.3145229730198031},
            "o3": {"aqi_level": 1, "value": 48.8483987731408},
            "overall_aqi_level": 2,
            "pm10": {"aqi_level": 2, "value": 24.464592631770792},
            "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
            "so2": {"aqi_level": 1, "value": 0.676714188255428},
            "valid_date": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
        },
        {
            "base_time": datetime(2024, 5, 27, 13, 0, tzinfo=timezone.utc),
            "location_name": "Abidjan",
            "location_type": "city",
            "no2": {"aqi_level": 1, "value": 0.3145229730198031},
            "o3": {"aqi_level": 1, "value": 48.8483987731408},
            "overall_aqi_level": 2,
            "pm10": {"aqi_level": 2, "value": 24.464592631770792},
            "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
            "so2": {"aqi_level": 1, "value": 0.676714188255428},
            "valid_date": datetime(2024, 5, 27, 13, 0, tzinfo=timezone.utc),
        },
    ]
