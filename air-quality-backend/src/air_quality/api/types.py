from datetime import datetime

from typing_extensions import TypedDict
from typing import NotRequired

from air_quality.database.locations import AirQualityLocationType


class PollutantDataDto(TypedDict):
    aqi_level: int
    value: float


class ForecastDto(TypedDict):
    base_time: datetime
    valid_time: datetime
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


class AggregateAqiDataDto(TypedDict):
    mean: float
    median: float


class AggregatePollutantDataDto(TypedDict):
    mean: int
    median: int


class SummarizedPollutantDataDto(TypedDict):
    aqi_level: AggregateAqiDataDto
    value: AggregatePollutantDataDto


class MeasurementSummaryDto(TypedDict):
    measurement_base_time: datetime
    location_type: AirQualityLocationType
    location_name: str
    overall_aqi_level: AggregateAqiDataDto
    no2: NotRequired[SummarizedPollutantDataDto]
    o3: NotRequired[SummarizedPollutantDataDto]
    pm2_5: NotRequired[SummarizedPollutantDataDto]
    pm10: NotRequired[SummarizedPollutantDataDto]
    so2: NotRequired[SummarizedPollutantDataDto]
