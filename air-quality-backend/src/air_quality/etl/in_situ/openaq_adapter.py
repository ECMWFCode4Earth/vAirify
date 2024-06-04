from datetime import datetime
from functools import reduce
import logging
from air_quality.etl.air_quality_index.pollutant_type import PollutantType
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
        "value": measurement['value'],
        "unit": measurement['unit'],
        "original_value": measurement['value'],
        "original_unit": measurement['unit']
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


def transform_city(city_name, city_data):
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
        logging.info(f"No in situ measurements found for {city_name}")

    return formatted_dataset


def convert_units(city_data, forecast_data: ForecastData):
    for in_situ_station in city_data:
        for pollutant in PollutantType:
            if pollutant.value in in_situ_station and in_situ_station[pollutant.value]["original_unit"] == "ppm":
                in_situ_station[pollutant.value]["unit"] = "µg/m³"
                original_value = in_situ_station[pollutant.value]["value"]

                lat = in_situ_station["location"]["coordinates"][0]
                long = in_situ_station["location"]["coordinates"][1]
                time = in_situ_station["measurement_date"]
                details = forecast_data.get_details_for_lat_long(lat, long, time)

                in_situ_station[pollutant.value]["value"] = convert_ppm_to_mgm3(original_value, pollutant, forecast_data)

    return city_data

def convert_ppm_to_mgm3(ppm_value, pollutantType: PollutantType, forecast_data):
    return ppm_value * 10