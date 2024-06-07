from datetime import datetime
from typing import TypedDict, NotRequired

from air_quality.database.locations import AirQualityLocationType


class PollutantDataDto(TypedDict):
    aqi_level: int
    value: float


class ForecastDto(TypedDict):
    base_time: datetime
    valid_date: datetime
    location_type: AirQualityLocationType
    location_name: str
    overall_aqi_level: float
    no2: PollutantDataDto
    o3: PollutantDataDto
    pm2_5: PollutantDataDto
    pm10: PollutantDataDto
    so2: PollutantDataDto


class MeasurementDto(TypedDict):
    measurement_date: datetime
    location_type: AirQualityLocationType
    location_name: str
    api_source: str
    no2: NotRequired[float]
    o3: NotRequired[float]
    pm2_5: NotRequired[float]
    pm10: NotRequired[float]
    so2: NotRequired[float]
    entity: NotRequired[str]
    sensor_type: NotRequired[str]
    site_name: str
