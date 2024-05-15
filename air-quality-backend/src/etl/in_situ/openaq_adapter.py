from datetime import datetime
import logging
from src.etl.air_quality_index.calculator import (
    get_pollutant_index_level,
    get_overall_aqi_level,
)
from src.etl.air_quality_index.pollutant_type import PollutantType
from src.etl.in_situ.sort_in_situ import sort_by_distance_and_time

required_pollutant_data = {
    "o3": PollutantType.OZONE,
    "no2": PollutantType.NITROGEN_DIOXIDE,
    "so2": PollutantType.SULPHUR_DIOXIDE,
    "pm10": PollutantType.PARTICULATE_MATTER_10,
    "pm25": PollutantType.PARTICULATE_MATTER_2_5,
}


def _extract_pollutants(data):
    output = []
    for pollutant in required_pollutant_data.keys():
        output.append(data[pollutant]["aqi_level"])
    return output


def _calculate_overall_aqi_value(formatted_dataset):
    for i in range(0, len(formatted_dataset)):
        # 3 being the amount of non measurement fields in the data dictionary
        if 3 + len(required_pollutant_data.keys()) == len(formatted_dataset[i].keys()):
            formatted_dataset[i]["overall_aqi_level"] = get_overall_aqi_level(
                _extract_pollutants(formatted_dataset[i])
            )
    return formatted_dataset


def transform_in_situ_data(in_situ_data):
    formatted_dataset = []
    for city_name, city_data in in_situ_data.items():
        city = city_data["city"]
        measurements = city_data["measurements"]
        if len(measurements) > 0:
            formatted_dataset.extend(
                _sort(
                    measurements,
                    city_name,
                    city["latitude"],
                    city["longitude"],
                )
            )
        else:
            logging.debug(f"No in situ measurements found for {city_name}")

    return _calculate_overall_aqi_value(formatted_dataset)


def _create_document(measurement, city_name):
    return {
        "city": city_name,
        "city_location": {
            "type": "Point",
            "coordinates": [
                measurement["coordinates"]["longitude"],
                measurement["coordinates"]["latitude"],
            ],
        },
        "measurement_date": datetime.strptime(
            measurement["date"]["utc"], "%Y-%m-%dT%H:%M:%S%z"
        ),
    }


def _sort(in_situ_data_for_city, city_name, input_lat, input_lon):
    formatted_cities_measurement = []
    sorted_cities_measurement = sort_by_distance_and_time(
        in_situ_data_for_city, input_lat, input_lon
    )

    chosen_place = ""
    current_time = ""
    to_create_document = True

    for i in range(0, len(sorted_cities_measurement)):
        measurement = sorted_cities_measurement[i]
        measurement_location = measurement["location"]
        measurement_date = measurement["date"]["utc"]

        if measurement_location != chosen_place and i != 0:
            # Taking all data from first location
            # when the location changes, we have all data and can end.
            return formatted_cities_measurement

        elif measurement_date != current_time and i != 0:
            # if time of measurement changes then we check if the created doc
            # is missing all data and if it is we can just delete it.
            length_of_formatted_list = len(formatted_cities_measurement) - 1
            if len(formatted_cities_measurement[length_of_formatted_list].keys()) <= 3:
                # logging.debug(formatted_cities_measurement[length_of_formatted_list])
                formatted_cities_measurement.pop(length_of_formatted_list)
            to_create_document = True

        if to_create_document:
            # Creates database document if the time in current_time
            # and sorted_cities_measurement[i]["date"]["utc"] has changed.
            chosen_place = measurement_location
            current_time = measurement_date
            formatted_cities_measurement.append(
                _create_document(measurement, city_name)
            )
            to_create_document = False

        if (
            measurement["value"] != -1
            and measurement["parameter"] in required_pollutant_data.keys()
        ):
            formatted_cities_measurement[len(formatted_cities_measurement) - 1][
                measurement["parameter"]
            ] = {
                "aqi_level": get_pollutant_index_level(
                    float(measurement["value"]),
                    required_pollutant_data[measurement["parameter"]],
                ),
                "value": measurement["value"],
            }
    return formatted_cities_measurement
