from datetime import datetime

from typing_extensions import Generic, TypedDict, NotRequired, TypeVar, Tuple

from air_quality.database.in_situ import ApiSource
from air_quality.database.locations import AirQualityLocationType


class PollutantDataDto(TypedDict):
    aqi_level: int
    value: float


class ForecastDto(TypedDict):
    base_time: datetime
    valid_time: datetime
    location_type: AirQualityLocationType
    location_name: str
    location_coordinates: Tuple[float, float]
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
    api_source: ApiSource
    no2: NotRequired[float]
    o3: NotRequired[float]
    pm2_5: NotRequired[float]
    pm10: NotRequired[float]
    so2: NotRequired[float]
    entity: NotRequired[str]
    sensor_type: NotRequired[str]
    site_name: str
    site_coordinates: Tuple[float, float]


T = TypeVar("T")


class AggregateDataDto(TypedDict, Generic[T]):
    mean: T


class MeasurementSummaryDto(TypedDict):
    measurement_base_time: datetime
    location_type: AirQualityLocationType
    location_name: str
    overall_aqi_level: AggregateDataDto[int]
    no2: NotRequired[AggregateDataDto[PollutantDataDto]]
    o3: NotRequired[AggregateDataDto[PollutantDataDto]]
    pm2_5: NotRequired[AggregateDataDto[PollutantDataDto]]
    pm10: NotRequired[AggregateDataDto[PollutantDataDto]]
    so2: NotRequired[AggregateDataDto[PollutantDataDto]]
