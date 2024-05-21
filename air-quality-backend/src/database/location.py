from typing import TypedDict


class AirQualityLocation(TypedDict):
    name: str
    latitude: float
    longitude: float
    type: str
