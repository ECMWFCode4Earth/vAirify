from datetime import datetime
from typing import Dict, List

from fastapi import APIRouter, Query
from src.mappers.forecast_mapper import map_measurement_counts
from src.services.forecast_service import get_measurements_for_time_range
from src.types import LocationType

router = APIRouter()


@router.get("/counts")
async def get_measurement_counts(
    date_from: datetime,
    date_to: datetime,
    location_type: LocationType = "city",
    location_names: List[str] = Query(None),
) -> Dict:
    """Get count of measurements per city and pollutant for a given time range"""
    measurements = await get_measurements_for_time_range(
        date_from=date_from,
        date_to=date_to,
        location_type=location_type,
        location_names=location_names,
    )

    counts = map_measurement_counts(measurements)
    print("Measurement counts:", counts)  # Debug logging
    return counts
