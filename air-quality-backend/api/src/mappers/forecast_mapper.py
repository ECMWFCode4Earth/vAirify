from datetime import UTC
from typing import List

from src.types import ForecastDto
from shared.src.database.forecasts import Forecast


def database_to_api_result(measurement: Forecast) -> ForecastDto:
    return {
        "base_time": measurement["forecast_base_time"].astimezone(UTC),
        "valid_time": measurement["forecast_valid_time"].astimezone(UTC),
        "location_type": measurement["location_type"],
        "location_name": measurement["name"],
        "location": {
            "longitude": measurement["location"]["coordinates"][0],
            "latitude": measurement["location"]["coordinates"][1],
        },
        "overall_aqi_level": measurement["overall_aqi_level"],
        "no2": measurement["no2"],
        "o3": measurement["o3"],
        "pm2_5": measurement["pm2_5"],
        "pm10": measurement["pm10"],
        "so2": measurement["so2"],
    }


def map_forecast(measurements_from_database: List[Forecast]) -> List[ForecastDto]:
    return list(map(database_to_api_result, measurements_from_database))
