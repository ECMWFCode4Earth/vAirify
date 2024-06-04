from datetime import datetime
from typing import TypedDict, NotRequired

from air_quality.database.locations import AirQualityLocationType


class MeasurementDto(TypedDict):
    measurementDate: datetime
    locationType: AirQualityLocationType
    locationName: str
    apiSource: str
    no2: NotRequired[float]
    o3: NotRequired[float]
    pm2_5: NotRequired[float]
    pm10: NotRequired[float]
    so2: NotRequired[float]
    entity: NotRequired[str]
    sensorType: NotRequired[str]
    siteName: str
