from bson import ObjectId
from datetime import datetime, timezone
from air_quality.database.in_situ import InSituMeasurement


def create_mock_measurement_document(overrides) -> InSituMeasurement:
    default_document = {
        "_id": ObjectId("66558bf12d46a42baea0b8e1"),
        "measurement_date": datetime(2024, 6, 4, 0, 0, tzinfo=timezone.utc),
        "name": "City Name",
        "location_name": "location",
        "api_source": "test api",
        "created_time": datetime(2024, 6, 4, 0, 0, tzinfo=timezone.utc),
        "last_modified_time": datetime(2024, 6, 4, 0, 0, tzinfo=timezone.utc),
        "location": {"type": "Point", "coordinates": [0, 0]},
        "location_type": "city",
        "metadata": {"entity": "Entity", "sensor_type": "Test Sensor"},
        "o3": 0.0,
        "no2": 0.0,
        "so2": 0.0,
        "pm10": 0.0,
        "pm2_5": 0.0,
    }
    return {**default_document, **overrides}
