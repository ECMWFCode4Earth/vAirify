from datetime import datetime
from decimal import Decimal
import logging
from typing import TypedDict
from .forecast_data import ForecastData
from src.etl.air_quality_index import calculator as aqi_calculator
from src.etl.air_quality_index.pollutant_type import PollutantType

required_pollutant_data = [
    ("o3", PollutantType.OZONE),
    ("no2", PollutantType.NITROGEN_DIOXIDE),
    ("so2", PollutantType.SULPHUR_DIOXIDE),
    ("pm10", PollutantType.PARTICULATE_MATTER_10),
    ("pm2_5", PollutantType.PARTICULATE_MATTER_2_5),
]


class PollutantData(TypedDict):
    values_ug_m3: list[float]
    aqi_values: list[int]


def _get_pollutant_values_by_type(
    forecast_data: ForecastData, city
) -> dict[PollutantType:PollutantData]:
    city_forecast_data_by_type: dict[PollutantType:PollutantData] = {}
    for pollutant_type in PollutantType:
        pollutant_forecast_values_for_city = (
            forecast_data.get_pollutant_data_for_lat_long(
                city["latitude"], city["longitude"], pollutant_type
            )
        )
        pollutant_values_ug_m3 = [
            float(Decimal(str(x)) * Decimal(10**9))
            for x in pollutant_forecast_values_for_city
        ]
        city_forecast_data_by_type[pollutant_type] = {
            "values_ug_m3": pollutant_values_ug_m3,
            "aqi_values": list(
                map(
                    lambda x: aqi_calculator.get_pollutant_index_level(
                        x, pollutant_type
                    ),
                    pollutant_values_ug_m3,
                )
            ),
        }
    return city_forecast_data_by_type


def _get_overall_aqi_value_for_slice(
    city_forecast_data_by_type: dict[PollutantType:PollutantData], index: int
) -> int:
    return aqi_calculator.get_overall_aqi_level(
        list(
            map(
                lambda x: x["aqi_values"][index],
                city_forecast_data_by_type.values(),
            )
        )
    )


def transform(forecast_data: ForecastData, cities):
    valid_time_values = forecast_data.get_valid_time_values()
    formatted_dataset = []

    for city in cities:
        city_name = city["name"]
        logging.info(f"Processing city: {city_name}")
        city_forecast_data_by_type = _get_pollutant_values_by_type(forecast_data, city)

        for i in range(0, valid_time_values.size):
            measurement_timestamp = valid_time_values[i]
            measurement_date = datetime.utcfromtimestamp(measurement_timestamp)
            overall_aqi_value = _get_overall_aqi_value_for_slice(
                city_forecast_data_by_type, i
            )

            pollutant_data = {}
            for name, pollutant_type in required_pollutant_data:
                city_forecast_data = city_forecast_data_by_type[pollutant_type]
                pollutant_data[name] = {
                    "aqi_level": city_forecast_data["aqi_values"][i],
                    "value": city_forecast_data["values_ug_m3"][i],
                }

            document = {
                "city": city_name,
                "city_location": {
                    "type": "Point",
                    "coordinates": [city["longitude"], city["latitude"]],
                },
                "measurement_date": measurement_date,
                "overall_aqi_level": overall_aqi_value,
                **pollutant_data,
            }

            logging.debug(document)
            formatted_dataset.append(document)

    return formatted_dataset
