from datetime import datetime

from bson import ObjectId


def create_mock_forecast_document(overrides):
    default_document = {
        "_id": ObjectId("66558bf12d46a42baea0b8e1"),
        "forecast_base_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "forecast_valid_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "name": "Location",
        "source": "cams-production",
        "location_type": "city",
        "last_modified_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "created_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "location": {"type": "Point", "coordinates": [0, 0]},
        "forecast_range": 0,
        "overall_aqi_level": 0,
        "o3": {"aqi_level": 0, "value": 0.0},
        "no2": {"aqi_level": 0, "value": 0.0},
        "so2": {"aqi_level": 0, "value": 0.0},
        "pm10": {"aqi_level": 0, "value": 0.0},
        "pm2_5": {"aqi_level": 0, "value": 0.0},
    }
    return {**default_document, **overrides}
