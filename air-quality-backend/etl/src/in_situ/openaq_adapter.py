from datetime import datetime
from functools import reduce
import logging

from shared.src.database.locations import AirQualityLocationType
from shared.src.aqi.pollutant_type import (
    PollutantType,
    pollutants_with_molecular_weight,
)
from shared.src.database.in_situ import InSituMeasurement, ApiSource
from ..common.unit_converter import convert_ppm_to_mgm3
from ..forecast.forecast_data import ForecastData, ForecastDataType

required_pollutant_data = {
    "o3": PollutantType.OZONE,
    "no2": PollutantType.NITROGEN_DIOXIDE,
    "so2": PollutantType.SULPHUR_DIOXIDE,
    "pm10": PollutantType.PARTICULATE_MATTER_10,
    "pm25": PollutantType.PARTICULATE_MATTER_2_5,
}


def measurement_is_valid(measurement):
    pollutant = required_pollutant_data[measurement["parameter"]]
    if (
        pollutant not in pollutants_with_molecular_weight()
        and measurement["unit"] == "ppm"
    ):
        logging.info(
            f"Unsupported unit found for pollutant without "
            f"molecular weight {measurement['unit']}"
        )
        return False

    valid_unit = measurement["unit"] in ["µg/m³", "ppm"]
    if not valid_unit:
        logging.info(f"Unsupported unit found {measurement['unit']}")

    return valid_unit and measurement["value"] > 0 and measurement["value"] != 9999


def _create_document(
    measurement, city_name: str, location_type: AirQualityLocationType
) -> InSituMeasurement:
    return {
        "api_source": ApiSource.OPENAQ.value,
        "measurement_date": datetime.strptime(
            measurement["date"]["utc"], "%Y-%m-%dT%H:%M:%S%z"
        ),
        "name": city_name,
        "location_type": location_type,
        "location_name": measurement["location"],
        "location": {
            "type": "point",
            "coordinates": (
                measurement["coordinates"]["longitude"],
                measurement["coordinates"]["latitude"],
            ),
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


def transform_city(city_data) -> list[InSituMeasurement]:
    formatted_dataset = []
    city = city_data["city"]
    measurements_for_city = city_data["measurements"]
    if len(measurements_for_city) > 0:
        filtered_measurements = filter(measurement_is_valid, measurements_for_city)
        grouped_measurements = reduce(
            combine_measurement,
            filtered_measurements,
            {"city": city["name"], "location_type": city["type"], "results": {}},
        )["results"]
        formatted_dataset.extend(list(grouped_measurements.values()))
    else:
        logging.info(f"No in situ measurements found for {city['name']}")

    return formatted_dataset


def enrich_with_forecast_data(
    in_situ_measurements: list[InSituMeasurement], forecast_data: ForecastData
):

    in_situ_readings = forecast_data.enrich_in_situ_measurements(
        in_situ_measurements,
        [ForecastDataType.TEMPERATURE, ForecastDataType.SURFACE_PRESSURE],
    )

    enriched_measurements = []
    for in_situ_reading, forecast_dict in in_situ_readings:
        sp = forecast_dict[ForecastDataType.SURFACE_PRESSURE]
        t = forecast_dict[ForecastDataType.TEMPERATURE]

        in_situ_reading["metadata"]["estimated_surface_pressure_pa"] = sp
        in_situ_reading["metadata"]["estimated_temperature_k"] = t

        for pollutant in pollutants_with_molecular_weight():
            if (
                pollutant.value in in_situ_reading
                and in_situ_reading[pollutant.value]["original_unit"] == "ppm"
            ):
                original_value = in_situ_reading[pollutant.value]["original_value"]

                in_situ_reading[pollutant.value]["value"] = convert_ppm_to_mgm3(
                    original_value, pollutant, sp, t
                )

                in_situ_reading[pollutant.value]["unit"] = "µg/m³"

        enriched_measurements.append(in_situ_reading)

    return enriched_measurements
