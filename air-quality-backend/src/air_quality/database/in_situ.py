import logging
from datetime import datetime
from typing import TypedDict, NotRequired

from bson import ObjectId

from air_quality.database.locations import AirQualityLocationType
from .mongo_db_operations import get_collection, upsert_data, GeoJSONPoint

collection_name = "in_situ_data"


class InSituMetadata(TypedDict):
    entity: str
    sensor_type: str


class InSituMeasurement(TypedDict):
    _id: ObjectId
    measurement_date: datetime
    name: str
    location_name: str
    api_source: str
    created_time: datetime
    last_modified_time: datetime
    location: GeoJSONPoint
    location_type: AirQualityLocationType
    metadata: InSituMetadata
    no2: NotRequired[float]
    o3: NotRequired[float]
    pm2_5: NotRequired[float]
    pm10: NotRequired[float]
    so2: NotRequired[float]


def insert_data(data):
    upsert_data(collection_name, ["measurement_date", "name", "location_name"], data)


def delete_data_before(measurement_date: datetime):
    result = get_collection(collection_name).delete_many(
        {"measurement_date": {"$lt": measurement_date}}
    )
    logging.info(f"Deleted {result.deleted_count} documents from in_situ_data")


def find_by_criteria(
    measurement_date_from: datetime,
    measurement_date_to: datetime,
    location_type: AirQualityLocationType,
    locations: [str] = None,
    api_source: str = None,
) -> list[InSituMeasurement]:
    criteria = {
        "measurement_date": {
            "$gte": measurement_date_from,
            "$lte": measurement_date_to,
        },
        "location_type": location_type.value,
    }
    if locations is not None:
        criteria["name"] = {"$in": locations}
    if api_source is not None:
        criteria["api_source"] = api_source
    logging.info(f"Querying collection with criteria: {criteria}")
    return list(get_collection(collection_name).find(criteria))
