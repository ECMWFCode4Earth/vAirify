import logging as log
from datetime import datetime
from typing import List

from fastapi import Query, APIRouter

from air_quality.api.mappers.measurements_mapper import (
    map_measurements,
    map_summarized_measurements,
)
from air_quality.api.types import MeasurementSummaryDto, MeasurementDto
from air_quality.database.in_situ import ApiSource, get_averaged, find_by_criteria
from air_quality.database.locations import AirQualityLocationType

router = APIRouter()


@router.get("/air-pollutant/measurements")
async def get_measurements(
    date_from: datetime,
    date_to: datetime,
    location_type: AirQualityLocationType,
    location_names: List[str] = Query(None),
    api_source: ApiSource = None,
) -> List[MeasurementDto]:
    log.info(
        f"Fetching measurements between {date_from} - {date_to} for {location_type}"
    )
    db_results = find_by_criteria(
        date_from, date_to, location_type, location_names, api_source
    )

    log.info(f"Responding with {len(db_results)} results")
    return map_measurements(db_results)


@router.get("/air-pollutant/measurements/summary")
async def get_measurements_summary(
    measurement_base_time: datetime,
    measurement_time_range: int,
    location_type: AirQualityLocationType,
) -> List[MeasurementSummaryDto]:
    log.info(
        "Fetching measurements aggregated around {} (+/- {}) for {}".format(
            measurement_base_time, measurement_time_range, location_type
        )
    )
    averaged_measurements = get_averaged(
        measurement_base_time, measurement_time_range, location_type
    )
    log.info(f"Found results for {len(averaged_measurements)} locations")
    return map_summarized_measurements(averaged_measurements)
