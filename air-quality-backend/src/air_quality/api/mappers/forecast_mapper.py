from datetime import UTC
from typing import List

from air_quality.api.types import ForecastDto
from air_quality.database.forecasts import Forecast


def database_to_api_result(forecast: Forecast) -> ForecastDto:
    return {
        "base_time": forecast["forecast_base_time"].astimezone(UTC),
        "valid_time": forecast["forecast_valid_time"].astimezone(UTC),
        "location_type": forecast["location_type"],
        "location_name": forecast["name"],
        "location_coordinates": forecast["location"]["coordinates"],
        "overall_aqi_level": forecast["overall_aqi_level"],
        "no2": forecast["no2"],
        "o3": forecast["o3"],
        "pm2_5": forecast["pm2_5"],
        "pm10": forecast["pm10"],
        "so2": forecast["so2"],
    }


def map_forecast(measurements_from_database: List[Forecast]) -> List[ForecastDto]:
    return list(map(database_to_api_result, measurements_from_database))
