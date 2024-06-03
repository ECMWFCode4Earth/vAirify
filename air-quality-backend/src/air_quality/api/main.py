from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from logging import config
import logging as log
from typing import List, Optional
from air_quality.api.mappers.forecast_mapper import map_forecast
from air_quality.api.mappers.measurements_mapper import map_measurements
from air_quality.database.forecasts import get_forecast_data_from_database
from air_quality.database.in_situ import find_by_criteria
from air_quality.database.locations import AirQualityLocationType


load_dotenv()
app = FastAPI()
config.fileConfig("./logging.ini")


@app.get("/air-pollutant-forecast")
async def get_forecast_data(
    location_type: AirQualityLocationType,
    valid_date_from: datetime,
    valid_date_to: datetime,
    forecast_base_time: datetime,
    location_name: Optional[str] = None,
):
    return map_forecast(
        get_forecast_data_from_database(
            valid_date_from,
            valid_date_to,
            location_type.value,
            forecast_base_time,
            location_name,
        )
    )


@app.get("/air-pollutant/measurements")
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
