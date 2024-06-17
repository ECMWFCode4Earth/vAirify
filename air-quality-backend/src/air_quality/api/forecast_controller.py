import logging as log
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter

from air_quality.api.mappers.forecast_mapper import map_forecast
from air_quality.api.types import ForecastDto
from air_quality.database.forecasts import get_forecast_data_from_database
from air_quality.database.locations import AirQualityLocationType

router = APIRouter()


@router.get("/air-pollutant/forecast")
async def get_forecast_data(
    location_type: AirQualityLocationType,
    valid_time_from: datetime,
    valid_time_to: datetime,
    base_time: datetime,
    location_name: Optional[str] = None,
) -> List[ForecastDto]:
    log.info(
        "Fetching forecast data ({}) between {} - {} for {}".format(
            base_time, valid_time_from, valid_time_to, location_type
        )
    )
    db_results = get_forecast_data_from_database(
        valid_time_from,
        valid_time_to,
        location_type.value,
        base_time,
        location_name,
    )
    log.info(f"Responding with {len(db_results)} results")
    return map_forecast(db_results)
