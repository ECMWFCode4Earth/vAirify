from datetime import datetime

from bson import ObjectId

forecast_from_database = [
    {
        "_id": ObjectId("66558bf12d46a42baea0b8e1"),
        "forecast_base_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "forecast_valid_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "name": "Abidjan",
        "source": "cams-production",
        "location_type": "city",
        "last_modified_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "created_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "location": {"type": "Point", "coordinates": [-4.01266, 5.30966]},
        "forecast_range": 0,
        "overall_aqi_level": 2,
        "o3": {"aqi_level": 1, "value": 48.8483987731408},
        "no2": {"aqi_level": 1, "value": 0.3145229730198031},
        "so2": {"aqi_level": 1, "value": 0.676714188255428},
        "pm10": {"aqi_level": 2, "value": 24.464592631770792},
        "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
    },
    {
        "_id": ObjectId("66558bf12d46a42baea0b8e4"),
        "forecast_base_time": datetime.strptime(
            "2024-05-27T13:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "forecast_valid_time": datetime.strptime(
            "2024-05-27T13:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "name": "Abidjan",
        "source": "cams-production",
        "location_type": "city",
        "last_modified_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "created_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "location": {"type": "Point", "coordinates": [-4.01266, 5.30966]},
        "forecast_range": 0,
        "overall_aqi_level": 2,
        "o3": {"aqi_level": 1, "value": 48.8483987731408},
        "no2": {"aqi_level": 1, "value": 0.3145229730198031},
        "so2": {"aqi_level": 1, "value": 0.676714188255428},
        "pm10": {"aqi_level": 2, "value": 24.464592631770792},
        "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
    },
    {
        "_id": ObjectId("66558bf12d46a42baea0b8e8"),
        "forecast_base_time": datetime.strptime(
            "2024-05-26T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "forecast_valid_time": datetime.strptime(
            "2024-05-26T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "name": "Abidjan",
        "source": "cams-production",
        "location_type": "city",
        "last_modified_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "created_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "location": {"type": "Point", "coordinates": [-4.01266, 5.30966]},
        "forecast_range": 0,
        "overall_aqi_level": 2,
        "o3": {"aqi_level": 1, "value": 48.8483987731408},
        "no2": {"aqi_level": 1, "value": 0.3145229730198031},
        "so2": {"aqi_level": 1, "value": 0.676714188255428},
        "pm10": {"aqi_level": 2, "value": 24.464592631770792},
        "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
    },
    {
        "_id": ObjectId("66558bf12d46a42baea0b8ed"),
        "forecast_base_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "forecast_valid_time": datetime.strptime(
            "2024-05-27T21:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "name": "London",
        "source": "cams-production",
        "location_type": "city",
        "last_modified_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "created_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "location": {"type": "Point", "coordinates": [-4.01266, 5.30966]},
        "forecast_range": 0,
        "overall_aqi_level": 2,
        "o3": {"aqi_level": 1, "value": 48.8483987731408},
        "no2": {"aqi_level": 1, "value": 0.3145229730198031},
        "so2": {"aqi_level": 1, "value": 0.676714188255428},
        "pm10": {"aqi_level": 2, "value": 24.464592631770792},
        "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
    },
    {
        "_id": ObjectId("66558bf12d46a42baea0b8f2"),
        "forecast_base_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "forecast_valid_time": datetime.strptime(
            "2024-05-27T22:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "name": "London",
        "source": "cams-production",
        "location_type": "city",
        "last_modified_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "created_time": datetime.strptime(
            "2024-05-27T12:00:00+00:00", "%Y-%m-%dT%H:%M:%S%z"
        ),
        "location": {"type": "Point", "coordinates": [-4.01266, 5.30966]},
        "forecast_range": 0,
        "overall_aqi_level": 2,
        "o3": {"aqi_level": 1, "value": 48.8483987731408},
        "no2": {"aqi_level": 1, "value": 0.3145229730198031},
        "so2": {"aqi_level": 1, "value": 0.676714188255428},
        "pm10": {"aqi_level": 2, "value": 24.464592631770792},
        "pm2_5": {"aqi_level": 2, "value": 14.396278071945583},
    },
]
