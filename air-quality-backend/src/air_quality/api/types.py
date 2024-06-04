from datetime import datetime
from typing import TypedDict, NotRequired

from air_quality.database.locations import AirQualityLocationType


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
