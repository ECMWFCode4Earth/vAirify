from datetime import datetime, timezone

import pytest
import xarray as xr
import numpy as np
from unittest.mock import patch

from etl.src.forecast.forecast_texture_storer import (
    _chunk_data_array,
    _create_output_directory,
    _write_texture_to_disk,
    save_data_textures,
)
from shared.tests.util.mock_forecast_data import default_time


@pytest.mark.parametrize(
    "num_time_steps, expected_num_chunks",
    [
        (4, 3),  # Standard case: 3 chunks
        (11, 1),  # Edge case: Only 1 chunk, as num_time_steps equals total time steps
        (1, 11),  # Edge case: Each time step is its own chunk
        (0, 1),  # Edge case: num_time_steps is 0, should default to 1 chunk
        (-1, 1),  # Edge case: num_time_steps is negative, should default to 1 chunk
        (
            20,
            1,
        ),  # Edge case: should default to 1 chunk
    ],
)
def test__chunk_data_array(num_time_steps, expected_num_chunks):
    rgb_data_array = np.random.rand(11, 121, 1).astype(np.uint8)
    num_lon = 11
    time_vector = xr.DataArray(np.linspace(0, 10, 11), dims="time")

    chunks, time_steps_dict = _chunk_data_array(
        rgb_data_array, num_time_steps, num_lon, time_vector
    )

    assert len(chunks) == expected_num_chunks
    assert all(chunk.shape[0] == 11 for chunk in chunks)
    assert all(chunk.shape[2] == 1 for chunk in chunks)
    assert len(time_steps_dict) == expected_num_chunks

    for i in range(expected_num_chunks):
        assert "time_start" in time_steps_dict[i]
        assert "time_end" in time_steps_dict[i]


@patch("os.makedirs")
@patch("os.getcwd", return_value="/current/working/directory")
def test__create_output_directory__directory_does_not_already_exist(
    mock_getcwd, mock_makedirs
):
    forecast_date = "2024-07-09"

    with patch("os.path.exists", side_effect=lambda path: False):
        expected_directory = f"/current/working/directory/data_textures/{forecast_date}"
        result = _create_output_directory(forecast_date)

        mock_makedirs.assert_called_once_with(expected_directory, exist_ok=True)
        assert result == expected_directory


@patch("os.makedirs")
@patch("os.getcwd", return_value="/current/working/directory")
def test__create_output_directory__directory_already_exists(mock_getcwd, mock_makedirs):
    forecast_date = "2024-07-09"

    with patch(
        "os.path.exists",
        side_effect=lambda path: path == f"/app/data_textures/{forecast_date}",
    ):
        expected_directory = f"/app/data_textures/{forecast_date}"
        result = _create_output_directory(forecast_date)

        mock_makedirs.assert_called_once_with(expected_directory, exist_ok=True)
        assert result == expected_directory


@patch("PIL.Image.Image.save")
def test__write_texture_to_disk(mock_save):
    rgb_data_array = np.random.rand(11, 121, 1).astype(np.uint8)
    output_directory = "test_output"
    forecast_date = datetime.fromtimestamp(default_time, timezone.utc).strftime(
        "%Y-%m-%d_%H"
    )
    variable = "pm10"
    num_chunk = 1
    total_chunks = 3
    file_format = "png"

    output_file = _write_texture_to_disk(
        rgb_data_array,
        output_directory,
        forecast_date,
        variable,
        num_chunk,
        total_chunks,
        file_format,
    )

    assert output_file == (
        f"{output_directory}/{variable}_{forecast_date}_CAMS_global."
        f"chunk_{num_chunk}_of_{total_chunks}.{file_format}"
    )
    mock_save.assert_called_once()


@patch("etl.src.forecast.forecast_texture_storer._chunk_data_array")
@patch("etl.src.forecast.forecast_texture_storer._create_output_directory")
@patch("etl.src.forecast.forecast_texture_storer._write_texture_to_disk")
def test__save_data_textures(
    mock_write_texture_to_disk, mock_create_output_directory, mock_chunk_data_array
):
    rgb_data_array = np.random.rand(11, 121, 1).astype(np.uint8)
    num_lon = 11
    time_vector = xr.DataArray(np.linspace(0, 10, 11), dims="time")
    variable_name = "pm10"
    forecast_date = "2024-07-09_00"
    min_value = 0
    max_value = 100.0
    units = "kg m**-3 * 1e-9"

    # Mocking _chunk_data_array
    mock_chunk_data_array.return_value = (
        [
            np.random.rand(11, 44, 1).astype(np.uint8),
            np.random.rand(11, 44, 1).astype(np.uint8),
            np.random.rand(11, 33, 1).astype(np.uint8),
        ],
        {
            0: {"time_start": "2024-07-09 00:00:00", "time_end": "2024-07-09 03:00:00"},
            1: {"time_start": "2024-07-09 03:00:00", "time_end": "2024-07-09 06:00:00"},
            2: {"time_start": "2024-07-09 06:00:00", "time_end": "2024-07-09 09:00:00"},
        },
    )

    mock_create_output_directory.return_value = "/mock/output/directory"

    mock_write_texture_to_disk.side_effect = (
        lambda chunk, output_directory, forecast_date, variable_name, chunk_num,
        total_chunks, file_format:
        f"/mock/output/directory/{forecast_date}_{variable_name}_chunk{chunk_num}."
        f"{file_format}"
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

    assert len(documents) == 3
    for i, doc in enumerate(documents):
        assert doc["forecast_base_time"] == datetime.strptime(forecast_date, '%Y-%m-%d_%H')
        assert doc["variable"] == variable_name
        assert doc["source"] == "cams-production"
        assert doc["min_value"] == min_value
        assert doc["max_value"] == max_value
        assert doc["units"] == units
        assert (
            doc["texture_uri"]
            == f"/mock/output/directory/{forecast_date}_{variable_name}_chunk{i+1}.webp"
        )
        time_start_datetime = datetime.fromisoformat(mock_chunk_data_array.return_value[1][i]["time_start"])
        assert (
            doc["time_start"] == time_start_datetime
        )
        time_end_datetime = datetime.fromisoformat(mock_chunk_data_array.return_value[1][i]["time_end"])
        assert doc["time_end"] == time_end_datetime
        assert doc["chunk"] == f"{i+1} of 3"
