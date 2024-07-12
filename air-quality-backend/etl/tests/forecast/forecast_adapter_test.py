from datetime import datetime, timezone

import pytest
from cerberus import Validator
import numpy as np
from unittest.mock import patch

from shared.src.database.locations import AirQualityLocationType
from etl.src.forecast.forecast_adapter import (
    ForecastData,
    transform,
    _normalise_data,
    _convert_data,
    create_data_textures,
    PollutantType,
)
from shared.tests.util.mock_forecast_data import (
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


@patch(
    "etl.src.forecast.forecast_adapter._process_variable",
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
def test_create_data_textures(mock_process_variable):

    mock_forecast_data = ForecastData(
        gridded_data_single_level, gridded_data_multi_level
    )
    db_metadata = create_data_textures(mock_forecast_data)

    assert mock_process_variable.call_count == len(PollutantType) + 1

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
        assert doc["texture_uri"] == "test_uri"
