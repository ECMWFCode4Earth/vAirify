import logging
from datetime import datetime
from typing import TypedDict, List

from bson import ObjectId

from shared.src.database.locations import AirQualityLocationType
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


class DataTexture(TypedDict):
    _id: ObjectId
    forecast_base_time: datetime
    source: str
    time_start: datetime
    variable: str
    time_end: datetime
    chunk: str
    last_modified_time: datetime
    max_value: float
    min_value: float
    texture_uri: str
    units: str
    created_time: datetime


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
        ["forecast_base_time", "variable", "source", "time_start", "time_end"],
        textures,
    )


def delete_forecast_data_before(forecast_base_time: datetime):
    result = get_collection("forecast_data").delete_many(
        {"forecast_base_time": {"$lt": forecast_base_time}}
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


def get_forecast_dates_between(
        forecast_base_search_start: datetime,
        forecast_base_search_end: datetime,
) -> List[datetime]:
    collection = get_collection("forecast_data")
    query = {
        "forecast_base_time": {
            "$gte": forecast_base_search_start,
            "$lte": forecast_base_search_end
        }
    }
    items = collection.find(query).distinct("forecast_base_time")
    return [i.replace(tzinfo=None) for i in items]


def get_data_textures_from_database(
    forecast_base_time: datetime,
) -> List[DataTexture]:
    collection = get_collection("data_textures")
    query = {
        "forecast_base_time": forecast_base_time,
    }

    return list(collection.find(query))


def delete_data_texture_data_before(forecast_base_time: datetime):
    result = get_collection("data_textures").delete_many(
        {"forecast_base_time": {"$lt": forecast_base_time}}
    )
    logging.info(f"Deleted {result.deleted_count} documents from data_textures")
