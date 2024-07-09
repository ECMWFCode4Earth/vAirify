from enum import Enum
from typing import TypedDict
from .mongo_db_operations import get_collection


class AirQualityLocationType(Enum):
    CITY = "city"


class AirQualityLocation(TypedDict):
    name: str
    latitude: float
    longitude: float
    type: AirQualityLocationType


def get_locations_by_type(
    location_type: AirQualityLocationType,
) -> list[AirQualityLocation]:
    collection = get_collection("locations")
    cursor = collection.find({"type": location_type.value})
    results = []
    for document in cursor:
        results.append(document)
    return results
