from datetime import datetime
from functools import reduce
import logging
from air_quality.database.locations import AirQualityLocationType
from air_quality.aqi.pollutant_type import PollutantType

required_pollutant_data = {
    "o3": PollutantType.OZONE,
    "no2": PollutantType.NITROGEN_DIOXIDE,
    "so2": PollutantType.SULPHUR_DIOXIDE,
    "pm10": PollutantType.PARTICULATE_MATTER_10,
    "pm25": PollutantType.PARTICULATE_MATTER_2_5,
}


def measurement_value_is_positive(measurement):
    return measurement["value"] > 0


def _create_document(
    measurement, city_name: str, location_type: AirQualityLocationType
):
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


def combine_measurement(state, measurement):
    key = f"{measurement['location']}_{measurement['date']['utc']}"
    results = state["results"]
    if key not in results:
        results[key] = _create_document(
            measurement, state["city"], state["location_type"]
        )
    measurement_value = measurement["value"]
    measurement_parameter = measurement["parameter"]
    measurement_parameter_key = required_pollutant_data[measurement_parameter]
    results[key][measurement_parameter_key.value] = measurement_value
    return state


def transform(in_situ_data):
    formatted_dataset = []
    for city_name, city_data in in_situ_data.items():
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
            logging.info(f"No in situ measurements found for {city_name}")

    return formatted_dataset
