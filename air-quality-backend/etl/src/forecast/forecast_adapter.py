from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Dict, Tuple
import logging
from typing import TypedDict
from .forecast_data import ForecastData, convert_to_forecast_data_type
from .forecast_texture_storer import save_data_textures
from shared.src.xarray_utils import get_dim_names
from shared.src.database.locations import AirQualityLocation
from shared.src.aqi import calculator as aqi_calculator
from shared.src.aqi.pollutant_type import PollutantType
import xarray as xr
import numpy as np

# Constants
WIND_10M = "winds_10m"

VARIABLE_RANGES = {
    "pm10": (0, 1000.0),
    "pm2p5": (0, 1000.0),
    "no2": (0, 100.0),
    "so2": (0, 100.0),
    "go3": (0, 500.0),
    WIND_10M: (-50, 50.0),
}

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


def _normalise_data(arr: np.ndarray, norm_min: float, norm_max: float) -> np.ndarray:
    if norm_min == norm_max:
        return np.zeros_like(arr)
    return (arr - norm_min) / (norm_max - norm_min)


def _convert_data(
    input_data: xr.Dataset, variable: str
) -> Tuple[np.ndarray, float, float, str, int, xr.DataArray]:
    """
    Convert data to numpy array.

    :param input_data: The input dataset.
    :param variable: The variable to convert.

    :return: A tuple containing the RGB data array, min value, max value, units, number
    of longitudes, and time vector.
    """
    lat, lon, time = get_dim_names(input_data)
    num_lat, num_lon, num_time = len(lat), len(lon), len(time)

    if variable == WIND_10M:
        rgb_data_array = np.zeros((num_lat, num_lon * num_time, 3), dtype=np.uint8)
        units = input_data["u10"].attrs.get("units", "Unknown")
    else:
        rgb_data_array = np.zeros((num_lat, num_lon * num_time, 1), dtype=np.uint8)
        units = input_data[variable].attrs.get("units", "Unknown") + " * 1e-9"

    min_val, max_val = VARIABLE_RANGES.get(variable, (0, 1))

    time_dim = time.dims[0]  # Extract the dimension name as a string

    for tt in range(num_time):
        start_index = tt * num_lon
        end_index = (tt + 1) * num_lon
        if variable == WIND_10M:
            normalised_data_U = _normalise_data(
                input_data["u10"].isel({time_dim: tt}), min_val, max_val
            )
            normalised_data_V = _normalise_data(
                input_data["v10"].isel({time_dim: tt}), min_val, max_val
            )
            rgb_data_array[:, start_index:end_index, 0] = np.clip(
                normalised_data_U * 255, 0, 255
            )
            rgb_data_array[:, start_index:end_index, 1] = np.clip(
                normalised_data_V * 255, 0, 255
            )
        else:
            normalised_data = _normalise_data(
                input_data[variable].isel({time_dim: tt}) * 1e9, min_val, max_val
            )
            rgb_data_array[:, start_index:end_index, 0] = np.clip(
                normalised_data * 255, 0, 255
            )

    return rgb_data_array, min_val, max_val, units, num_lon, time


def _process_variable(
    data: xr.Dataset,
    data_type: str,
    variable_name: str,
    forecast_date: str,
) -> List[Dict[str, str]]:
    """
    Process a specific variable and create data textures.

    :param data: The dataset containing the variable.
    :param data_type: The type of the data.
    :param variable_name: The name of the variable.
    :param forecast_date: The forecast date.

    :return: A list of dictionaries containing data texture metadata for the database.
    """

    rgb_data_array, min_value, max_value, units, num_lon, time_vector = _convert_data(
        data, data_type
    )

    documents = save_data_textures(
        rgb_data_array,
        num_lon,
        time_vector,
        variable_name,
        forecast_date,
        min_value,
        max_value,
        units,
    )

    return documents


def create_data_textures(forecast_data: ForecastData):
    """
    Create gridded data textures from forecast data for frontend maps
    :param forecast_data:
    :return: List of dictionaries containing data texture metadata for database
    """
    forecast_date = datetime.fromtimestamp(
        forecast_data.get_time_value(), timezone.utc
    ).strftime("%Y-%m-%d_%H")
    db_metadata = []

    for pollutant in PollutantType:
        logging.info(f"Creating data textures for {pollutant.name}")
        forecast_data_type = convert_to_forecast_data_type(pollutant)
        dataset = forecast_data._get_data_set(forecast_data_type)
        new_documents = _process_variable(
            dataset,
            forecast_data_type.value,
            pollutant.value,
            forecast_date,
        )
        db_metadata.extend(new_documents)

    logging.info("Creating data textures for WINDS")
    new_documents = _process_variable(
        forecast_data._single_level_data,
        WIND_10M,
        WIND_10M,
        forecast_date,
    )
    db_metadata.extend(new_documents)

    return db_metadata
