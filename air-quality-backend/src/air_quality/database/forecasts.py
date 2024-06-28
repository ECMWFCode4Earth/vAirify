import logging
from datetime import datetime
from typing import TypedDict, List

from bson import ObjectId

from air_quality.database.locations import AirQualityLocationType
from .mongo_db_operations import get_collection, upsert_data, GeoJSONPoint


class PollutantData(TypedDict):
    aqi_level: int
    value: float


class Forecast(TypedDict):
    _id: ObjectId
    forecast_valid_time: datetime
    forecast_base_time: datetime
    location_type: AirQualityLocationType
    name: str
    source: str
    created_time: datetime
    last_modified_time: datetime
    location: GeoJSONPoint
    location_name: str
    overall_aqi_level: float
    no2: PollutantData
    o3: PollutantData
    pm2_5: PollutantData
    pm10: PollutantData
    so2: PollutantData


def insert_data(data):
    upsert_data(
        "forecast_data",
        [
            "forecast_base_time",
            "forecast_valid_time",
            "location_type",
            "name",
            "source",
        ],
        data,
    )

def insert_textures(textures):
    upsert_data(
        "data_textures",
        [
            "forecast_base_time",
            "variable",
            "source",
            "time_start",
            "time_end"
        ],
        textures,
    )


def delete_data_before(forecast_valid_time: datetime):
    result = get_collection("forecast_data").delete_many(
        {"forecast_valid_time": {"$lt": forecast_valid_time}}
    )
    logging.info(f"Deleted {result.deleted_count} documents from forecast_data")


def get_forecast_data_from_database(
    valid_time_from: datetime,
    valid_time_to: datetime,
    location_type: str,
    forecast_base_time: datetime,
    location_name: str = None,
) -> List[Forecast]:
    collection = get_collection("forecast_data")
    query = {
        "location_type": location_type,
        "forecast_base_time": forecast_base_time,
        "forecast_valid_time": {
            "$gte": valid_time_from,
            "$lte": valid_time_to,
        },
    }
    if location_name is not None:
        query["name"] = location_name
    return list(collection.find(query))
