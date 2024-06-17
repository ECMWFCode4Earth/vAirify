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
        "no2": create_measurement_summary_database_data_pollutant_value(
            13, "µg/m³", 13, "µg/m³"
        ),
        "o3": create_measurement_summary_database_data_pollutant_value(
            48, "µg/m³", 48, "µg/m³"
        ),
        "pm2_5": create_measurement_summary_database_data_pollutant_value(
            5.8, "µg/m³", 5.8, "µg/m³"
        ),
        "pm10": create_measurement_summary_database_data_pollutant_value(
            15, "µg/m³", 15, "µg/m³"
        ),
        "so2": create_measurement_summary_database_data_pollutant_value(
            9, "µg/m³", 9, "µg/m³"
        ),
    }

    return {**default_city, **overrides}


def create_in_situ_database_data(
    measurement_date: datetime,
    name: str,
    location_name: str,
    no2_value: float = None,
    o3_value: float = None,
    pm2_5_value: float = None,
    pm10_value: float = None,
    so2_value: float = None,
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

    if no2_value is not None:
        created_city["no2"] = create_measurement_summary_database_data_pollutant_value(
            no2_value, "µg/m³", no2_value, "µg/m³"
        )
    if o3_value is not None:
        created_city["o3"] = create_measurement_summary_database_data_pollutant_value(
            o3_value, "µg/m³", o3_value, "µg/m³"
        )
    if pm10_value is not None:
        created_city["pm10"] = create_measurement_summary_database_data_pollutant_value(
            pm10_value, "µg/m³", pm10_value, "µg/m³"
        )
    if pm2_5_value is not None:
        created_city["pm2_5"] = (
            create_measurement_summary_database_data_pollutant_value(
                pm2_5_value, "µg/m³", pm2_5_value, "µg/m³"
            )
        )
    if so2_value is not None:
        created_city["so2"] = create_measurement_summary_database_data_pollutant_value(
            so2_value, "µg/m³", so2_value, "µg/m³"
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


def create_measurement_summary_database_data_pollutant_value(
    value: float, unit: str, original_value: float, original_unit: str
):
    return {
        "value": value,
        "unit": unit,
        "original_value": original_value,
        "original_unit": original_unit,
    }
