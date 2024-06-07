from datetime import datetime, timezone

from air_quality.database.in_situ import InSituMeasurement, InSituAveragedMeasurement


def create_mock_measurement_document(overrides) -> InSituMeasurement:
    default_document = {
        "measurement_date": datetime(2024, 6, 4, 0, 0, tzinfo=timezone.utc),
        "name": "City Name",
        "location_name": "location",
        "api_source": "test api",
        "created_time": datetime(2024, 6, 4, 0, 0, tzinfo=timezone.utc),
        "last_modified_time": datetime(2024, 6, 4, 0, 0, tzinfo=timezone.utc),
        "location": {"type": "Point", "coordinates": [0, 0]},
        "location_type": "city",
        "metadata": {"entity": "Entity", "sensor_type": "Test Sensor"},
    }
    return {**default_document, **overrides}


def create_mock_averaged_measurement_document(overrides) -> InSituAveragedMeasurement:
    default_document = {
        "measurement_base_time": datetime(2024, 6, 4, 0, 0, tzinfo=timezone.utc),
        "name": "City Name",
        "location_type": "city",
    }
    return {**default_document, **overrides}
