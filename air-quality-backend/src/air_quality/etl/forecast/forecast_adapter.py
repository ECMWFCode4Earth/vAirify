from datetime import datetime, timezone
from decimal import Decimal
import logging
from typing import TypedDict
from .forecast_data import ForecastData, convert_to_forecast_data_type
from air_quality.database.locations import AirQualityLocation
from air_quality.aqi import calculator as aqi_calculator
from air_quality.aqi.pollutant_type import PollutantType
import re
import os
import xarray as xr
import numpy as np
from PIL import Image

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

def _get_dimension_by_attr(dataset, attr_name, attr_value):
    """
    Find the dimension by attribute name and value.
    params:
        dataset (xarray.Dataset): The dataset to search.
        attr_name (str): The attribute name to search for.
        attr_value (str): The attribute value to match.
    
    return:
        xarray.DataArray: The matching DataArray if found, otherwise None.
    """
    for var in dataset.variables.values():
        if attr_name in var.attrs and var.attrs[attr_name] == attr_value:
            return var
    return None


def _get_spatial_temporal_dims(dataset):
    """
    Get the latitude, longitude, and time dimensions from the dataset.
    params:
        dataset (xarray.Dataset): The dataset to search.
    return:
        tuple: A tuple containing (latitude, longitude, time) DataArrays.
    """
    lat = _get_dimension_by_attr(dataset, 'units', 'degrees_north')
    lon = _get_dimension_by_attr(dataset, 'units', 'degrees_east')
    time = _get_dimension_by_attr(dataset, 'standard_name', 'time')    
    return lat, lon, time


def _normalise_data(arr, norm_min, norm_max):
    return (arr - norm_min) / (norm_max - norm_min)

def _normalize_data_irregular(arr, intervals):
    # Ensure the intervals are sorted
    intervals = np.sort(intervals)
    num_intervals = len(intervals)
    
    # Calculate the normalized values for each interval
    normalized_values = np.linspace(0, 1, num_intervals)
    
    def normalize_value(value):
        # Find the correct interval for the value
        for i in range(1, num_intervals):
            if value <= intervals[i]:
                return normalized_values[i-1]
        return 1.0  # If the value is greater than the last interval

    # Vectorize the function for efficiency
    normalize_vectorized = np.vectorize(normalize_value)
    return normalize_vectorized(arr)

def _convert_data(input_data: xr.Dataset, variable: str):
    """
    Convert data to numpy array
    :param input_data:
    :param variable:
    :return rgb_data_array:
    """
    lat, lon, time = _get_spatial_temporal_dims(input_data)

    rgb_data_array = np.zeros( ( len(lat), len(lon) * len(time), 1 ))

    if variable == 'pm10' or variable == 'pm2p5':
        min_val = 0
        max_val = 500.
    elif variable == 'no2' or variable == 'so2':
        min_val = 0
        max_val = 100.
    elif variable == 'go3':
        min_val = 0
        max_val = 150.

    for tt in range(len(time)):
        start_index = tt * len(lon)
        end_index = (tt + 1) * len(lon)
        normalised_data = _normalise_data(input_data[variable].isel(step=tt) * 1e9, min_val, max_val)
        # normalised_data = _normalize_data_irregular(input_data[variable].isel(step=tt) * 1e9, intervals)
        rgb_data_array[:, start_index:end_index, 0] = np.clip(normalised_data * 255, 0, 255)

    return np.uint8(rgb_data_array)

def _convert_data_wind(input_data: xr.Dataset):
    """
    Convert data to numpy array
    :param input_data:
    :param variable:
    :return rgb_data_array:
    """
    lat, lon, time = _get_spatial_temporal_dims(input_data)

    rgb_data_array = np.zeros( ( len(lat), len(lon) * len(time), 3 ))

    min_val = -30
    max_val = 30.

    for tt in range(len(time)):
        start_index = tt * len(lon)
        end_index = (tt + 1) * len(lon)
        normalised_data_U = _normalise_data(input_data["u10"].isel(step=tt), min_val, max_val)
        normalised_data_V = _normalise_data(input_data["v10"].isel(step=tt), min_val, max_val)
        rgb_data_array[:, start_index:end_index, 0] = np.clip(normalised_data_U * 255, 0, 255)
        rgb_data_array[:, start_index:end_index, 1] = np.clip(normalised_data_V * 255, 0, 255)

    return np.uint8(rgb_data_array)


def _create_output_directory(forecast_data: ForecastData):
    """
    Create output directory for data textures
    :param forecast_data:
    :return output_directory:
    """

    filename = forecast_data._single_level_data.encoding.get('source', 'Unknown source')
    if filename != 'Unknown source':
        forecast_date = re.search(r'\d{4}-\d{2}-\d{2}_\d{2}', filename).group()

    output_directory = f"{os.getcwd()}/data_textures/{forecast_date}"
    os.makedirs(output_directory, exist_ok=True)
    return output_directory, forecast_date

def _save_data_textures(rgb_data_array, output_directory, forecast_date, variable, format):
    """
    Save data textures
    :param rgb_data_array:
    :param output_directory:
    :param variable:
    :return:
    """
    if ( format == "L" ):
        image_array = rgb_data_array.squeeze(axis=2)
    else:
        image_array = rgb_data_array
    image = Image.fromarray(image_array, format)
    output_file = f"{output_directory}/{variable}_{forecast_date}_CAMS_global.png"
    image.save(output_file, format='PNG')

def create_data_textures(forecast_data: ForecastData):
    """
    Create gridded data textures from forecast data for frontend maps
    :param forecast_data:
    :return:
    """
    output_directory, forecast_date = _create_output_directory(forecast_data)
    for pollutant in PollutantType:
        logging.info(f"Creating data texture for {pollutant.name}")
        forecast_data_type = convert_to_forecast_data_type(pollutant)
        dataset = forecast_data._get_data_set(forecast_data_type)
        rgb_data_array = _convert_data(dataset, forecast_data_type.value)
        _save_data_textures(rgb_data_array, output_directory, forecast_date, pollutant.value, "L")

    # logging.info(f"Creating data texture for 10m WINDS")
    # rgb_data_array = _convert_data_wind(forecast_data._single_level_data)
    # _save_data_textures(rgb_data_array, output_directory, forecast_date, 'winds_10m', "RGB")

