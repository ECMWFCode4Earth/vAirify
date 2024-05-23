from typing import TypedDict
from .mongo_db_operations import get_collection


class AirQualityLocation(TypedDict):
    name: str
    latitude: float
    longitude: float
    type: str


def get_locations_by_type(location_type: str) -> list[AirQualityLocation]:
    collection = get_collection("locations")
    cursor = collection.find({"type": location_type})
    results = []
    for document in cursor:
        results.append(document)
    return results
