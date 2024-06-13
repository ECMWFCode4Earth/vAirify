import datetime


def create_in_situ_database_data_with_overrides(overrides):
    default_city = {
        "measurement_date": datetime.datetime(
            2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "name": "Test City 1",
        "location_name": "Test City 1, Site 1, All keys",
        "api_source": "OpenAQ",
        "created_time": datetime.datetime(
            2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "last_modified_time": datetime.datetime(
            2024, 6, 12, 14, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "location": create_location_values("point", [54.433746, 24.424399]),
        "location_type": "city",
        "metadata": create_metadata_values(
            "Governmental Organization",
            "reference grade",
            100109.546875,
            314.317138671875,
        ),
        "no2": create_pollutant_value(13, "µg/m³", 13, "µg/m³"),
        "o3": create_pollutant_value(48, "µg/m³", 48, "µg/m³"),
        "pm2_5": create_pollutant_value(5.8, "µg/m³", 5.8, "µg/m³"),
        "pm10": create_pollutant_value(15, "µg/m³", 15, "µg/m³"),
        "so2": create_pollutant_value(9, "µg/m³", 9, "µg/m³"),
    }

    return {**default_city, **overrides}


def create_in_situ_database_data(
    measurement_date: datetime,
    name: str,
    location_name: str,
    no2: float = None,
    o3: float = None,
    pm2_5: float = None,
    pm10: float = None,
    so2: float = None,
):
    created_city = {
        "measurement_date": measurement_date,
        "name": name,
        "location_name": location_name,
        "api_source": "OpenAQ",
        "created_time": measurement_date,
        "last_modified_time": measurement_date,
        "location": {
            "type": "point",
            "coordinates": [54.433746, 24.424399],
        },
        "location_type": "city",
        "metadata": {
            "entity": "Governmental Organization",
            "sensor_type": "reference grade",
            "estimated_surface_pressure_pa": 100109.546875,
            "estimated_temperature_k": 314.317138671875,
        },
    }

    optional_pollutants = [no2, o3, pm2_5, pm10, so2]
    for pollutant_value in optional_pollutants:
        if pollutant_value is not None:
            created_city[str(pollutant_value)] = create_pollutant_value(
                pollutant_value, "µg/m³", pollutant_value, "µg/m³"
            )

    return created_city


def create_location_values(_type: str, coordinates: [float]):
    return {
        "type": _type,
        "coordinates": coordinates,
    }


def create_metadata_values(
    entity: str,
    sensor_type: str,
    estimated_surface_pressure_pa: float,
    estimated_temperature_k: float,
):
    return {
        "entity": entity,
        "sensor_type": sensor_type,
        "estimated_surface_pressure_pa": estimated_surface_pressure_pa,
        "estimated_temperature_k": estimated_temperature_k,
    }


def create_pollutant_value(
    value: float, unit: str, original_value: float, original_unit: str
):
    return {
        "value": value,
        "unit": unit,
        "original_value": original_value,
        "original_unit": original_unit,
    }
