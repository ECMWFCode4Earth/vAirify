from datetime import datetime, timezone

import pytest
from cerberus import Validator
import xarray as xr
import numpy as np
from unittest.mock import patch, MagicMock

from air_quality.database.locations import AirQualityLocationType
from air_quality.etl.forecast.forecast_adapter import (
    ForecastData,
    transform,
    _get_dimension_by_attr,
    _get_dim_names,
    _normalise_data,
    _convert_data,
    _chunk_data_array,
    _create_output_directory,
    _save_data_texture,
    _process_variable,
    create_data_textures,
    PollutantType,
)
from tests.util.mock_forecast_data import (
    single_level_data_set,
    multi_level_data_set,
    default_test_cities,
    default_time,
    gridded_data_single_level,
    gridded_data_multi_level,
)


@pytest.mark.parametrize(
    "field, expected",
    [
        ("name", ["Dublin", "Dublin", "London", "London"]),
        (
            "location",
            [
                {"coordinates": [0, -10], "type": "Point"},
                {"coordinates": [0, -10], "type": "Point"},
                {"coordinates": [10, 0], "type": "Point"},
                {"coordinates": [10, 0], "type": "Point"},
            ],
        ),
        (
            "forecast_valid_time",
            [
                datetime(2024, 4, 22, 0, 0, tzinfo=timezone.utc),
                datetime(2024, 4, 23, 0, 0, tzinfo=timezone.utc),
                datetime(2024, 4, 22, 0, 0, tzinfo=timezone.utc),
                datetime(2024, 4, 23, 0, 0, tzinfo=timezone.utc),
            ],
        ),
        ("forecast_base_time", datetime.fromtimestamp(default_time, timezone.utc)),
        ("forecast_range", [0, 24, 0, 24]),
        ("source", "cams-production"),
    ],
)
def test__transform__returns_correct_values(field, expected):
    input_data = ForecastData(single_level_data_set, multi_level_data_set)
    dublin_and_london = default_test_cities[0:2]
    results = transform(input_data, dublin_and_london)
    if isinstance(expected, list):
        assert list(map(lambda x: x[field], results)) == expected
    else:
        for data in results:
            assert data[field] == expected


def test__transform__returns_correctly_formatted_data():
    input_data = ForecastData(single_level_data_set, multi_level_data_set)
    expected_aqi_schema = {"type": "integer", "min": 1, "max": 6}
    expected_pollutant_schema = {
        "aqi_level": expected_aqi_schema,
        "value": {"type": "float"},
    }
    expected_document_schema = {
        "name": {"type": "string"},
        "location_type": {"allowed": [AirQualityLocationType.CITY]},
        "location": {
            "type": "dict",
            "schema": {
                "coordinates": {
                    "type": "list",
                    "minlength": 2,
                    "maxlength": 2,
                },
                "type": {
                    "type": "string",
                    "allowed": ["Point"],
                },
            },
        },
        "forecast_valid_time": {"type": "datetime"},
        "forecast_base_time": {"type": "datetime"},
        "forecast_range": {"type": "integer"},
        "no2": {"type": "dict", "schema": expected_pollutant_schema},
        "o3": {"type": "dict", "schema": expected_pollutant_schema},
        "pm10": {"type": "dict", "schema": expected_pollutant_schema},
        "pm2_5": {"type": "dict", "schema": expected_pollutant_schema},
        "so2": {"type": "dict", "schema": expected_pollutant_schema},
        "overall_aqi_level": expected_aqi_schema,
        "source": {"type": "string", "allowed": ["cams-production"]},
    }
    validator = Validator(expected_document_schema, require_all=True)
    result = transform(input_data, default_test_cities[0:1])
    for data in result:
        assert validator(data) is True, f"{validator.errors}"


def test__get_dimension_by_attr():
    lat = _get_dimension_by_attr(gridded_data_single_level, "units", "degrees_north")
    lon = _get_dimension_by_attr(gridded_data_single_level, "units", "degrees_east")
    time = _get_dimension_by_attr(gridded_data_single_level, "standard_name", "time")

    assert lat is not None
    assert lon is not None
    assert time is not None
    assert lat.attrs["units"] == "degrees_north"
    assert lon.attrs["units"] == "degrees_east"
    assert time.attrs["standard_name"] == "time"


def test__get_dim_names():
    lat, lon, time = _get_dim_names(gridded_data_single_level)

    assert lat is not None
    assert lon is not None
    assert time is not None
    assert lat.attrs["units"] == "degrees_north"
    assert lon.attrs["units"] == "degrees_east"
    assert time.attrs["standard_name"] == "time"


@pytest.mark.parametrize(
    "arr, norm_min, norm_max, expected",
    [
        (np.array([0, 50, 100]), 0, 100, np.array([0.0, 0.5, 1.0])),
        (np.array([0, 50, 100]), 50, 100, np.array([-1.0, 0.0, 1.0])),
        (np.array([10, 20, 30]), 10, 30, np.array([0.0, 0.5, 1.0])),
        (np.array([0, 1, 2]), 0, 2, np.array([0.0, 0.5, 1.0])),
        (np.array([-50, 0, 50]), -50, 50, np.array([0.0, 0.5, 1.0])),
        (
            np.array([10, 20, 30]),
            0,
            0,
            np.array([0.0, 0.0, 0.0]),
        ),  # Edge case: norm_max == norm_min
    ],
)
def test__normalise_data(arr, norm_min, norm_max, expected):
    norm_data = _normalise_data(arr, norm_min, norm_max)
    np.testing.assert_allclose(norm_data, expected, rtol=1e-5)


def test__convert_data():
    rgb_data_array, min_val, max_val, units, num_lon, time = _convert_data(
        gridded_data_single_level, "pm10"
    )

    assert rgb_data_array.shape == (11, 121, 1)
    assert min_val == 0
    assert max_val == 1000.0
    assert units == "micrograms_per_cubic_meter * 1e-9"
    assert num_lon == 11
    assert time is not None

    rgb_data_array_wind, _, _, _, _, _ = _convert_data(
        gridded_data_single_level, "winds_10m"
    )
    assert rgb_data_array_wind.shape == (11, 121, 3)


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
        ),  # Edge case: num_time_steps is greater than total time steps, should default to 1 chunk
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


@pytest.fixture
def mock_getcwd():
    with patch("os.getcwd", return_value="/current/working/directory"):
        yield


@pytest.fixture
def mock_makedirs():
    with patch("os.makedirs") as mock:
        yield mock


def test__create_output_directory_valid(mock_getcwd, mock_makedirs):
    input_data = ForecastData(single_level_data_set, multi_level_data_set)
    output_directory, forecast_date = _create_output_directory(input_data)
    timestamp = datetime.fromtimestamp(default_time, timezone.utc).strftime(
        "%Y-%m-%d_%H"
    )
    assert forecast_date == timestamp
    assert output_directory in [
        f"/app/data_textures/{timestamp}",
        f"/current/working/directory/data_textures/{timestamp}",
    ]
    mock_makedirs.assert_called_with(output_directory, exist_ok=True)


@patch("PIL.Image.Image.save")
def test__save_data_texture(mock_save):
    rgb_data_array = np.random.rand(11, 121, 1).astype(np.uint8)
    output_directory = "test_output"
    forecast_date = datetime.fromtimestamp(default_time, timezone.utc).strftime(
        "%Y-%m-%d_%H"
    )
    variable = "pm10"
    num_chunk = 1
    total_chunks = 3
    file_format = "png"

    output_file = _save_data_texture(
        rgb_data_array,
        output_directory,
        forecast_date,
        variable,
        num_chunk,
        total_chunks,
        file_format,
    )

    assert (
        output_file
        == f"{output_directory}/{variable}_{forecast_date}_CAMS_global.chunk_{num_chunk}_of_{total_chunks}.{file_format}"
    )
    mock_save.assert_called_once()


@patch("os.makedirs")
@patch("PIL.Image.Image.save", new=MagicMock())
def test__process_variable(mock_makedirs):
    output_directory = "test_output"
    forecast_date = datetime.fromtimestamp(default_time, timezone.utc).strftime(
        "%Y-%m-%d_%H"
    )
    chunks_per_texture = 16

    documents = _process_variable(
        gridded_data_single_level, "pm10", "pm10", output_directory, forecast_date
    )

    total_time_steps = len(gridded_data_single_level["time_steps"])
    expected_num_chunks = (
        total_time_steps + chunks_per_texture - 1
    ) // chunks_per_texture  # Ceiling division
    assert (
        len(documents) == expected_num_chunks
    ), f"Expected {expected_num_chunks} documents, got {len(documents)}"

    required_keys = {
        "texture_uri",
        "forecast_base_time",
        "variable",
        "source",
        "min_value",
        "max_value",
        "units",
        "time_start",
        "time_end",
        "chunk",
    }
    for doc in documents:
        assert required_keys.issubset(
            doc.keys()
        ), f"Document missing required keys: {doc.keys()}"

    for i, doc in enumerate(documents):
        assert "texture_uri" in doc, f"Document {i} missing 'texture_uri'"
        assert "forecast_base_time" in doc, f"Document {i} missing 'forecast_base_time'"
        assert "time_start" in doc, f"Document {i} missing 'time_start'"
        assert "time_end" in doc, f"Document {i} missing 'time_end'"


@patch(
    "air_quality.etl.forecast.forecast_adapter._create_output_directory",
    return_value=("test_output", "2024-09-01_00"),
)
@patch(
    "air_quality.etl.forecast.forecast_adapter._process_variable",
    return_value=[
        {
            "texture_uri": "test_uri",
            "forecast_base_time": "2024-09-01_00",
            "variable": "pm10",
            "source": "cams-production",
            "min_value": 0,
            "max_value": 100,
            "units": "micrograms_per_cubic_meter",
            "time_start": "2024-09-01_00",
            "time_end": "2024-09-01_01",
            "chunk": "1 of 1",
        }
    ],
)
def test_create_data_textures(mock_process_variable, mock_create_output_directory):

    mock_forecast_data = ForecastData(
        gridded_data_single_level, gridded_data_multi_level
    )
    db_metadata = create_data_textures(mock_forecast_data)

    mock_create_output_directory.assert_called_once_with(mock_forecast_data)
    assert mock_process_variable.call_count == len(PollutantType) + 1  # All pollutants + WINDS

    expected_num_docs = (
        len(PollutantType) * len(mock_process_variable.return_value)
    ) + len(
        mock_process_variable.return_value
    )  # One document per pollutant + one for WINDS
    assert (
        len(db_metadata) == expected_num_docs
    ), f"Expected {expected_num_docs} documents, got {len(db_metadata)}"

    required_keys = {
        "texture_uri",
        "forecast_base_time",
        "variable",
        "source",
        "min_value",
        "max_value",
        "units",
        "time_start",
        "time_end",
        "chunk",
    }
    for doc in db_metadata:
        assert required_keys.issubset(
            doc.keys()
        ), f"Document missing required keys: {doc.keys()}"
        print(doc)
        assert doc['texture_uri'] == 'test_uri'
