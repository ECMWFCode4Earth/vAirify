import logging
from datetime import datetime, timedelta
from typing import TypedDict, NotRequired, Optional

from bson import ObjectId

from air_quality.database.locations import AirQualityLocationType
from .mongo_db_operations import get_collection, upsert_data, GeoJSONPoint
from ..aqi.pollutant_type import PollutantType

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


class PollutantAverages(TypedDict):
    mean: Optional[float]
    median: Optional[float]


class InSituAveragedMeasurement(TypedDict):
    measurement_base_time: datetime
    location_type: AirQualityLocationType
    name: str
    no2: PollutantAverages
    o3: PollutantAverages
    pm2_5: PollutantAverages
    pm10: PollutantAverages
    so2: PollutantAverages


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


def get_averaged(
    measurement_base_time: datetime,
    measurement_time_range_minutes: int,
    location_type: AirQualityLocationType,
) -> [InSituAveragedMeasurement]:
    date_from = measurement_base_time - timedelta(
        minutes=measurement_time_range_minutes
    )
    date_to = measurement_base_time + timedelta(minutes=measurement_time_range_minutes)
    match_criteria = {
        "measurement_date": {
            "$gte": date_from,
            "$lt": date_to,
        },
        "location_type": location_type.value,
    }

    group_by_criteria = {
        "_id": "$name",
    }
    project_criteria = {
        "measurement_base_time": measurement_base_time,
        "location_type": location_type.value,
        "name": "$_id",
        "_id": 0,
    }

    for pollutant_type in PollutantType:
        pollutant_name = pollutant_type.value
        median_key = f"{pollutant_name}_median"
        mean_key = f"{pollutant_name}_mean"
        group_by_criteria[median_key] = {
            "$median": {
                "input": f"${pollutant_name}",
                "method": "approximate",
            }
        }
        group_by_criteria[mean_key] = {"$avg": f"${pollutant_name}"}
        project_criteria[pollutant_name] = {
            "mean": f"${mean_key}",
            "median": f"${median_key}",
        }

    logging.info(
        f"Averaging pollutant measurements with criteria between {date_from} and {date_to}"
    )
    results = get_collection(collection_name).aggregate(
        [
            {"$match": match_criteria},
            {"$group": group_by_criteria},
            {"$project": project_criteria},
        ]
    )
    return list(results)
