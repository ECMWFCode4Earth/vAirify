from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException

from src.air_quality.database.forecasts import get_forecast_data_from_database

app = FastAPI()

location_types = ["city"]


@app.get("/air-pollutant-forecast")
async def get_forecast_data(
    valid_date_from,
    valid_date_to,
    location_type,
    forecast_base_time,
    location_name: Optional[str] = None,
):
    try:
        valid_date_from = datetime.strptime(valid_date_from, "%Y-%m-%dT%H:%M:%S.%f%z")
        valid_date_to = datetime.strptime(valid_date_to, "%Y-%m-%dT%H:%M:%S.%f%z")
        forecast_base_time = datetime.strptime(
            forecast_base_time, "%Y-%m-%dT%H:%M:%S.%f%z"
        )
    except ValueError:
        raise HTTPException(
            400, "Incorrect data format, should be %Y-%m-%dT%H:%M:%S.%f%z"
        )

    if location_type not in location_types:
        raise HTTPException(400, "Incorrect location type")

    return get_forecast_data_from_database(
        valid_date_from, valid_date_to, location_type, forecast_base_time, location_name
    )
