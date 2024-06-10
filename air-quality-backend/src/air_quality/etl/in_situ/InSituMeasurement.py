from datetime import datetime
from typing import TypedDict, NotRequired

from air_quality.database.locations import AirQualityLocationType
from air_quality.database.mongo_db_operations import GeoJSONPoint

collection_name = "in_situ_data"


class InSituMetadata(TypedDict, total=False):
    entity: str
    sensor_type: str
    estimated_surface_pressure_pa: NotRequired[float]
    estimated_temperature_k: NotRequired[float]


class InSituPollutantReading(TypedDict, total=False):
    value: float
    unit: str
    original_value: float
    original_unit: str


class InSituMeasurement(TypedDict, total=False):
    measurement_date: datetime
    name: str
    location_name: str
    api_source: str
    location: GeoJSONPoint
    location_type: AirQualityLocationType
    metadata: InSituMetadata
    no2: NotRequired[InSituPollutantReading]
    o3: NotRequired[InSituPollutantReading]
    pm2_5: NotRequired[InSituPollutantReading]
    pm10: NotRequired[InSituPollutantReading]
    so2: NotRequired[InSituPollutantReading]
