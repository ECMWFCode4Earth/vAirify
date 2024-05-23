from datetime import datetime
from decimal import Decimal
import logging
from typing import TypedDict
from .forecast_data import ForecastData
from air_quality.database.locations import AirQualityLocation
from air_quality.etl.air_quality_index import calculator as aqi_calculator
from air_quality.etl.air_quality_index.pollutant_type import PollutantType

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
    forecast_data: ForecastData, location: AirQualityLocation
) -> dict[PollutantType:PollutantData]:
    forecast_data_by_type: dict[PollutantType:PollutantData] = {}
    for pollutant_type in PollutantType:
        pollutant_forecast_values = forecast_data.get_pollutant_data_for_lat_long(
            location["latitude"], location["longitude"], pollutant_type
        )
        pollutant_forecast_values_ug_m3 = [
            float(Decimal(str(x)) * Decimal(10**9)) for x in pollutant_forecast_values
        ]
        forecast_data_by_type[pollutant_type] = {
            "values_ug_m3": pollutant_forecast_values_ug_m3,
            "aqi_values": list(
                map(
                    lambda x: aqi_calculator.get_pollutant_index_level(
                        x, pollutant_type
                    ),
                    pollutant_forecast_values_ug_m3,
                )
            ),
        }
    return forecast_data_by_type


def _get_overall_aqi_value_for_slice(
    location_forecast_data_by_type: dict[PollutantType:PollutantData], index: int
) -> int:
    return aqi_calculator.get_overall_aqi_level(
        list(
            map(
                lambda x: x["aqi_values"][index],
                location_forecast_data_by_type.values(),
            )
        )
    )


def transform(forecast_data: ForecastData, location: AirQualityLocation) -> list:
    valid_time_values = forecast_data.get_valid_time_values()
    step_values = forecast_data.get_step_values()
    model_base_time = datetime.utcfromtimestamp(forecast_data.get_time_value())
    pollutant_forecast_for_location = []
    location_name = location["name"]
    location_type = location["type"]
    logging.debug(f"Processing location: {location_name} ({location['type']})")
    forecast_data_by_type = _get_pollutant_values_by_type(forecast_data, location)

    for i in range(0, valid_time_values.size):
        measurement_timestamp = valid_time_values[i]
        measurement_date = datetime.utcfromtimestamp(measurement_timestamp)
        overall_aqi_value = _get_overall_aqi_value_for_slice(forecast_data_by_type, i)

        pollutant_data = {}
        for name, pollutant_type in required_pollutant_data:
            forecast_data = forecast_data_by_type[pollutant_type]
            pollutant_data[name] = {
                "aqi_level": forecast_data["aqi_values"][i],
                "value": forecast_data["values_ug_m3"][i],
            }

        document = {
            "name": location_name,
            "location_type": location_type,
            "location": {
                "type": "Point",
                "coordinates": [location["longitude"], location["latitude"]],
            },
            "forecast_base_time": model_base_time,
            "forecast_valid_time": measurement_date,
            "forecast_range": int(step_values[i]),
            "overall_aqi_level": overall_aqi_value,
            "source": "cams-production",
            **pollutant_data,
        }

        pollutant_forecast_for_location.append(document)

    return pollutant_forecast_for_location
