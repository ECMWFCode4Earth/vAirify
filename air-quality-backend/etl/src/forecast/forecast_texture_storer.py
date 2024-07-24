from typing import List, Dict, Tuple
import os
import pandas as pd
import xarray as xr
import numpy as np
from PIL import Image
from datetime import datetime


def _chunk_data_array(
    rgb_data_array: np.ndarray,
    num_time_steps: int,
    num_lon: int,
    time_vector: xr.DataArray,
) -> Tuple[List[np.ndarray], Dict[int, Dict[str, str]]]:
    """
    Split the rgb_data_array into smaller parts along the num_lon * num_time dimension
    for smaller file sizes and faster loading times.

    :param rgb_data_array: array with shape (num_lat, num_lon * num_time, channels)
    :param num_time_steps: Number of time steps to use for each chunk
    :param num_lon: Number of longitude points
    :param time_vector: DataArray containing time information for each time step
    :return: A list of chunked arrays and a dictionary with start and end time
    stamps for each chunk
    """
    num_lat, total_lon_time, channels = rgb_data_array.shape
    num_total_time_steps = total_lon_time // num_lon

    chunks = []
    time_steps_dict = {}

    if num_time_steps <= 0 or num_time_steps > num_total_time_steps:
        num_time_steps = num_total_time_steps

    for i in range(0, num_total_time_steps, num_time_steps):
        start_time_step = i
        end_time_step = min(i + num_time_steps, num_total_time_steps)

        start_index = start_time_step * num_lon
        end_index = end_time_step * num_lon

        chunk = rgb_data_array[:, start_index:end_index, :]
        chunks.append(chunk)

        # time_start = pd.to_datetime(
        #     time_vector.data[start_time_step:end_time_step].min(), unit="s"
        # ).strftime("%Y-%m-%d %H:%M:%S")
        # time_end = pd.to_datetime(
        #     time_vector.data[start_time_step:end_time_step].max(), unit="s"
        # ).strftime("%Y-%m-%d %H:%M:%S")
        time_start = pd.to_datetime(
            time_vector.data[start_time_step:end_time_step].min(), unit="s"
        ).isoformat(timespec='milliseconds') + '+00:00'
        time_end = pd.to_datetime(
            time_vector.data[start_time_step:end_time_step].max(), unit="s"
        ).isoformat(timespec='milliseconds') + '+00:00'
        time_steps_dict[len(chunks) - 1] = {
            "time_start": time_start,
            "time_end": time_end,
        }

    return chunks, time_steps_dict


def _create_output_directory(forecast_date: str) -> str:
    """
    Create output directory for data textures.

    :param forecast_date: The forecast date timestamp.

    :return: The output directory path and forecast date.
    """

    output_directory = f"/app/data_textures/{forecast_date}"
    if not os.path.exists(output_directory):
        output_directory = f"{os.getcwd()}/data_textures/{forecast_date}"
    os.makedirs(output_directory, exist_ok=True)
    return output_directory


def _write_texture_to_disk(
    rgb_data_array: np.ndarray,
    output_directory: str,
    forecast_date: str,
    variable: str,
    num_chunk: str,
    total_chunks: str,
    file_format: str,
) -> str:
    """
    Save data textures to disk and convert to binary data.

    :param rgb_data_array: Numpy array containing the image data.
    :param output_directory: Directory to save the textures.
    :param forecast_date: Forecast date string.
    :param variable: Variable name to include in the filename.
    :param num_chunk: Chunk number.
    :param total_chunks: Total number of chunks.
    :param file_format: File format for saving the texture.

    :return: The path to the saved file.
    """
    if variable == "winds_10m":
        image_array = rgb_data_array
        format = "RGB"
    else:
        image_array = rgb_data_array.squeeze(axis=2)
        format = "L"

    image = Image.fromarray(image_array, format)
    output_file = (
        f"{output_directory}/{variable}_{forecast_date}_CAMS_global."
        f"chunk_{num_chunk}_of_{total_chunks}.{file_format}"
    )
    image.save(output_file, format=file_format, lossless=True)
    return output_file


def save_data_textures(
    rgb_data_array: np.ndarray,
    num_lon: int,
    time_vector: xr.DataArray,
    variable_name: str,
    forecast_date: str,
    min_value: float,
    max_value: float,
    units: str,
) -> List[str]:

    chunks_per_texture = 16
    file_format = "webp"

    chunk_list, chunk_dict = _chunk_data_array(
        rgb_data_array, chunks_per_texture, num_lon, time_vector
    )

    # WebP has better compression, but maximum pixel dimension is 16383 x 16383.
    max_webP_pixel_dimension = 16383
    if (num_lon * chunks_per_texture) > max_webP_pixel_dimension:
        file_format = "png"

    output_directory = _create_output_directory(forecast_date)

    documents = []

    for num_chunk, chunk in enumerate(chunk_list):
        output_file = _write_texture_to_disk(
            chunk,
            output_directory,
            forecast_date,
            variable_name,
            num_chunk + 1,
            len(chunk_list),
            file_format,
        )
        document = {
            "forecast_base_time": datetime.strptime(forecast_date, '%Y-%m-%d_%H'),
            "variable": variable_name,
            "source": "cams-production",
            "min_value": min_value,
            "max_value": max_value,
            "units": units,
            "texture_uri": output_file,
            "time_start": datetime.fromisoformat(chunk_dict[num_chunk]["time_start"]),
            "time_end": datetime.fromisoformat(chunk_dict[num_chunk]["time_end"]),
            "chunk": f"{num_chunk+1} of {len(chunk_list)}",
        }
        documents.append(document)

    return documents
