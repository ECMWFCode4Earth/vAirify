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
from io import BytesIO

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


def _get_dim_names(dataset):
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


def _convert_data(input_data: xr.Dataset, variable: str) -> np.ndarray:
    """
    Convert data to numpy array
    :param input_data:
    :param variable:
    :return rgb_data_array:
    """
    lat, lon, time = _get_dim_names(input_data)
    num_lat, num_lon, num_time = len(lat), len(lon), len(time)

    if variable == 'winds_10m':
        rgb_data_array = np.zeros((num_lat, num_lon * num_time, 3), dtype=np.uint8)
        units = input_data["u10"].attrs.get('units', 'Unknown')
    else:
        rgb_data_array = np.zeros((num_lat, num_lon * num_time, 1), dtype=np.uint8)
        units = input_data[variable].attrs.get('units', 'Unknown') + ' * 1e-9'

    variable_ranges = {
        'pm10': (0, 1000.),
        'pm2p5': (0, 1000.),
        'no2': (0, 100.),
        'so2': (0, 100.),
        'go3': (0, 150.),
        'winds_10m': (-50, 50.)
    }

    min_val, max_val = variable_ranges.get(variable, (0, 1))

    for tt in range(num_time):
        start_index = tt * num_lon
        end_index = (tt + 1) * num_lon
        if variable == 'winds_10m':
            normalised_data_U = _normalise_data(input_data["u10"].isel(step=tt), min_val, max_val)
            normalised_data_V = _normalise_data(input_data["v10"].isel(step=tt), min_val, max_val)
            rgb_data_array[:, start_index:end_index, 0] = np.clip(normalised_data_U * 255, 0, 255)
            rgb_data_array[:, start_index:end_index, 1] = np.clip(normalised_data_V * 255, 0, 255)
        else:
            normalised_data = _normalise_data(input_data[variable].isel(step=tt) * 1e9, min_val, max_val)
            rgb_data_array[:, start_index:end_index, 0] = np.clip(normalised_data * 255, 0, 255)

    return rgb_data_array, min_val, max_val, units


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

def _save_data_textures(rgb_data_array: np.ndarray, output_directory: str, forecast_date: str, variable: str) -> None:
    """
    Save data textures to disk and convert  to binary data.

    :param rgb_data_array: Numpy array containing the image data
    :param variable: Variable name to include in the filename
    :return: Binary data of the image
    """
    if variable == 'winds_10m':
        image_array = rgb_data_array
        format = 'RGB'
    else:
        image_array = rgb_data_array.squeeze(axis=2)
        format = 'L'

    image = Image.fromarray(image_array, format)
    # output_file = f"{output_directory}/{variable}_{forecast_date}_CAMS_global.png"
    # image.save(output_file, format='PNG', lossless=True)
    with BytesIO() as output:
        image.save(output, format='PNG')
        binary_data = output.getvalue()

    return binary_data

def create_data_textures(forecast_data: ForecastData):
    """
    Create gridded data textures from forecast data for frontend maps
    :param forecast_data:
    :return:
    """
    output_directory, forecast_date = _create_output_directory(forecast_data)
    documents = []

    for pollutant in PollutantType:
        logging.info(f"Creating data texture for {pollutant.name}")
        forecast_data_type = convert_to_forecast_data_type(pollutant)
        dataset = forecast_data._get_data_set(forecast_data_type)
        rgb_data_array, min_value, max_value, units = _convert_data(dataset, forecast_data_type.value)
        binary_data = _save_data_textures(rgb_data_array, output_directory, forecast_date, pollutant.value)

        document = {
            "forecast_base_time": forecast_date,
            "variable": pollutant.value,
            "source": "cams-production",
            "min_value": min_value,
            "max_value": max_value,
            "units": units,
            "image_data": binary_data
        }
        documents.append(document)


    logging.info(f"Creating data texture for WINDS")
    rgb_data_array, min_value, max_value, units = _convert_data(forecast_data._single_level_data, 'winds_10m')
    binary_data= _save_data_textures(rgb_data_array, output_directory, forecast_date, 'winds_10m')

    document = {
        "forecast_base_time": forecast_date,
        "variable": "winds_10m",
        "source": "cams-production",
        "min_value": min_value,
        "max_value": max_value,
        "units": units,
        "image_data": binary_data
    }
    documents.append(document)
    return documents