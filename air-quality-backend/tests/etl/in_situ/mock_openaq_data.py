def create_measurement(location_tuple, time, parameter, value):
    return {
        "locationId": location_tuple[0],
        "location": location_tuple[1],
        "parameter": parameter,
        "value": value,
        "date": {
            "utc": time,
            "local": "2024-04-21T01:00:00+01:00",
        },
        "unit": "µg/m³",
        "coordinates": {
            "latitude": location_tuple[2],
            "longitude": location_tuple[3],
        },
        "country": "IE",
        "city": None,
        "isMobile": False,
        "isAnalysis": None,
        "entity": "Governmental Organization",
        "sensorType": "reference grade",
    }
