from datetime import datetime
from functools import reduce
import logging
from air_quality.etl.air_quality_index.pollutant_type import (
    PollutantType,
    pollutants_with_molecular_weight,
)
from air_quality.etl.common.unit_converter import convert_ppm_to_mgm3
from air_quality.etl.forecast.forecast_data import ForecastData

required_pollutant_data = {
    "o3": PollutantType.OZONE,
    "no2": PollutantType.NITROGEN_DIOXIDE,
    "so2": PollutantType.SULPHUR_DIOXIDE,
    "pm10": PollutantType.PARTICULATE_MATTER_10,
    "pm25": PollutantType.PARTICULATE_MATTER_2_5,
}


def measurement_value_is_positive(measurement):
    return measurement["value"] > 0


def _create_document(measurement, city_name, location_type):
    return {
        "api_source": "OpenAQ",
        "measurement_date": datetime.strptime(
            measurement["date"]["utc"], "%Y-%m-%dT%H:%M:%S%z"
        ),
        "name": city_name,
        "location_type": location_type,
        "location_name": measurement["location"],
        "location": {
            "type": "Point",
            "coordinates": [
                measurement["coordinates"]["longitude"],
                measurement["coordinates"]["latitude"],
            ],
        },
        "metadata": {
            "entity": measurement["entity"],
            "sensor_type": measurement["sensorType"],
        },
    }


def _create_measurement_value(measurement):
    return {
        "value": measurement["value"],
        "unit": measurement["unit"],
        "original_value": measurement["value"],
        "original_unit": measurement["unit"],
    }


def combine_measurement(state, measurement):
    key = f"{measurement['location']}_{measurement['date']['utc']}"
    results = state["results"]
    if key not in results:
        results[key] = _create_document(
            measurement, state["city"], state["location_type"]
        )
    measurement_value = _create_measurement_value(measurement)
    measurement_parameter = measurement["parameter"]
    measurement_parameter_key = required_pollutant_data[measurement_parameter]
    results[key][measurement_parameter_key.value] = measurement_value
    return state


def transform_city(city_data):
    formatted_dataset = []
    city = city_data["city"]
    measurements_for_city = city_data["measurements"]
    if len(measurements_for_city) > 0:
        filtered_measurements = filter(
            measurement_value_is_positive, measurements_for_city
        )
        grouped_measurements = reduce(
            combine_measurement,
            filtered_measurements,
            {"city": city["name"], "location_type": city["type"], "results": {}},
        )["results"]
        formatted_dataset.extend(list(grouped_measurements.values()))
    else:
        logging.info(f"No in situ measurements found for {city['name']}")

    return formatted_dataset


def enrich_with_forecast_data(city_data, forecast_data: ForecastData):
    for in_situ_reading in city_data:
        long = in_situ_reading["location"]["coordinates"][0]
        lat = in_situ_reading["location"]["coordinates"][1]
        measurement_date = in_situ_reading["measurement_date"]

        surface_pressure = forecast_data.get_surface_pressure(
            lat, long, measurement_date
        )
        temperature = forecast_data.get_temperature(lat, long, measurement_date)

        in_situ_reading["metadata"]["estimated_surface_pressure_pa"] = surface_pressure
        in_situ_reading["metadata"]["estimated_temperature_k"] = temperature

        for pollutant in pollutants_with_molecular_weight():
            if (
                pollutant.value in in_situ_reading
                and in_situ_reading[pollutant.value]["original_unit"] == "ppm"
            ):
                original_value = in_situ_reading[pollutant.value]["value"]

                in_situ_reading[pollutant.value]["value"] = convert_ppm_to_mgm3(
                    original_value, pollutant, surface_pressure, temperature
                )

                in_situ_reading[pollutant.value]["unit"] = "µg/m³"

    return city_data
