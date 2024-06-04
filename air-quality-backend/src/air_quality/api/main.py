from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException

from air_quality.api.mappers.forecast_mapper import map_forecast
from air_quality.database.forecasts import get_forecast_data_from_database

app = FastAPI()

location_types = ["city"]


@app.get("/air-pollutant-forecast")
async def get_forecast_data(
    location_type,
    valid_date_from: datetime,
    valid_date_to: datetime,
    forecast_base_time: datetime,
    location_name: Optional[str] = None,
):
    if location_type not in location_types:
        raise HTTPException(400, "Incorrect location type")

    return map_forecast(
        get_forecast_data_from_database(
            valid_date_from,
            valid_date_to,
            location_type,
            forecast_base_time,
            location_name,
        )
    )
