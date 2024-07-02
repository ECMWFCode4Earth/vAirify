from datetime import datetime, timezone

from air_quality.database.in_situ import InSituMeasurement, InSituAveragedMeasurement


def create_mock_open_aq_response(overrides):
    default_open_aq_mock = {
        "locationId": 1,
        "location": "Dublin measurement station",
        "parameter": "so2",
        "value": 10,
        "date": {
            "utc": "2024-04-21T00:00:00+00:00",
            "local": "2024-04-21T01:00:00+01:00",
        },
        "unit": "µg/m³",
        "coordinates": {
            "latitude": 0.0,
            "longitude": 0.0,
        },
        "country": "IE",
        "city": None,
        "isMobile": False,
        "isAnalysis": None,
        "entity": "Governmental Organization",
        "sensorType": "reference grade",
    }

    return {**default_open_aq_mock, **overrides}


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
