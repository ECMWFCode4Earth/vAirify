from datetime import datetime, timezone
from decimal import Decimal
import logging
from typing import TypedDict
from .forecast_data import ForecastData
from shared.src.database.locations import AirQualityLocation
from shared.src.aqi import calculator as aqi_calculator
from shared.src.aqi.pollutant_type import PollutantType


class PollutantData(TypedDict):
    values_ug_m3: list[float]
    aqi_values: list[int]


def _convert_pollutant_values(pollutant_type: PollutantType, raw_values: list[float]):
    """
    Convert pollutant values to appropriate units and add aqi_values
    :param pollutant_type:
    :param raw_values:
    :return:
    """
    pollutant_forecast_values_ug_m3 = [
        float(Decimal(str(x)) * Decimal(10**9)) for x in raw_values
    ]
    return {
        "values_ug_m3": pollutant_forecast_values_ug_m3,
        "aqi_values": list(
            map(
                lambda x: aqi_calculator.get_pollutant_index_level(x, pollutant_type),
                pollutant_forecast_values_ug_m3,
            )
        ),
    }


def _get_overall_aqi_value_for_step(
    location_forecast_data_by_type: dict[PollutantType:PollutantData], index: int
) -> int:
    """
    Calculate overall AQI value for pollutants at single forecast_valid_time (step)
    :param location_forecast_data_by_type:
    :param index:
    :return: overall_aqi_value
    """
    return aqi_calculator.get_overall_aqi_level(
        list(
            map(
                lambda x: x["aqi_values"][index],
                location_forecast_data_by_type.values(),
            )
        )
    )


def transform(forecast_data: ForecastData, locations: list[AirQualityLocation]) -> list:
    pollutant_data_with_location = forecast_data.get_pollutant_data_for_locations(
        locations, list(PollutantType)
    )

    valid_time_values = forecast_data.get_valid_time_values()
    step_values = forecast_data.get_step_values()
    model_base_time = datetime.fromtimestamp(
        forecast_data.get_time_value(), timezone.utc
    )
    pollutant_forecast_for_location = []

    for location, data_by_pollutant in pollutant_data_with_location:
        location_name = location["name"]
        location_type = location["type"]
        logging.debug(f"Processing location: {location_name} ({location_type})")
        forecast_data_by_type = {
            pollutant_type: _convert_pollutant_values(pollutant_type, data)
            for pollutant_type, data in data_by_pollutant.items()
        }

        for i in range(0, step_values.size):
            measurement_timestamp = valid_time_values[i]
            measurement_date = datetime.fromtimestamp(
                measurement_timestamp, timezone.utc
            )
            overall_aqi_value = _get_overall_aqi_value_for_step(
                forecast_data_by_type, i
            )

            pollutant_data = {
                pollutant_type.value: {
                    "aqi_level": forecast_data_by_type[pollutant_type]["aqi_values"][i],
                    "value": forecast_data_by_type[pollutant_type]["values_ug_m3"][i],
                }
                for pollutant_type in PollutantType
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
