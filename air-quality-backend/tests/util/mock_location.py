from air_quality.database.locations import AirQualityLocation, AirQualityLocationType


def create_test_city(
    name: str, latitude: float, longitude: float
) -> AirQualityLocation:
    return {
        "name": name,
        "latitude": latitude,
        "longitude": longitude,
        "type": AirQualityLocationType.CITY,
    }
