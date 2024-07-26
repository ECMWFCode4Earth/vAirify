def create_open_aq_measurement(overrides):
    base_measurement = {
        "location": "test_measurement_station",
        "date": {"utc": "2024-05-24T13:10:20+00:00"},
        "coordinates": {"longitude": 1111, "latitude": 1112},
        "entity": "test_entity",
        "sensorType": "test_sensor_type",
        "value": 1,
        "unit": "µg/m³",
        "parameter": "o3",
    }

    return {**base_measurement, **overrides}
