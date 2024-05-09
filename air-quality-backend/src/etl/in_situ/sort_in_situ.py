from math import radians, sin, cos, sqrt, atan2
from datetime import datetime


def _haversine(latitude1, longitude1, latitude2, longitude2):
    latitude1 = radians(latitude1)
    longitude1 = radians(longitude1)
    latitude2 = radians(latitude2)
    longitude2 = radians(longitude2)

    difference_longitude = longitude2 - longitude1
    difference_latitude = latitude2 - latitude1
    a = (
        sin(difference_latitude / 2) ** 2
        + cos(latitude1) * cos(latitude2) * sin(difference_longitude / 2) ** 2
    )
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = 6371 * c
    return distance


def sort_by_distance_and_time(items, input_lat, input_lon):
    def distance_key(item):
        return _haversine(
            input_lat,
            input_lon,
            item["coordinates"]["latitude"],
            item["coordinates"]["longitude"],
        )

    sorted_items = sorted(
        items,
        key=lambda data: (
            distance_key(data),
            datetime.strptime(data["date"]["utc"], "%Y-%m" "-%dT%H" ":%M:%S%z"),
        ),
    )
    return sorted_items
