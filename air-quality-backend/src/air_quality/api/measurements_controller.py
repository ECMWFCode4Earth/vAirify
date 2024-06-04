from datetime import datetime
from fastapi import Query, APIRouter
import logging as log
from typing import List
from air_quality.api.mappers.measurements_mapper import map_measurements
from air_quality.database.in_situ import find_by_criteria
from air_quality.database.locations import AirQualityLocationType


router = APIRouter()


@router.get("/air-pollutant/measurements")
async def get_measurements(
    date_from: datetime,
    date_to: datetime,
    location_type: AirQualityLocationType,
    location_names: List[str] = Query(None),
    api_source: str = None,
):
    log.info(
        f"Fetching measurements between {date_from} - {date_to} for {location_type}"
    )
    db_results = find_by_criteria(
        date_from, date_to, location_type, location_names, api_source
    )

    log.info(f"Responding with {len(db_results)} results")
    return map_measurements(db_results)