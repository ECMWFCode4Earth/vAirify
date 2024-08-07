from datetime import datetime
from unittest.mock import patch

from etl.src.forecast.forecast_orchestrator import process_forecast
from etl.src.forecast.forecast_data import ForecastData
from shared.tests.util.mock_forecast_data import (
    single_level_data_set,
    multi_level_data_set,
)
from shared.tests.util.mock_location import create_test_city


@patch("etl.src.forecast.forecast_orchestrator.fetch_forecast_data")
@patch("etl.src.forecast.forecast_orchestrator.transform")
@patch("etl.src.forecast.forecast_orchestrator.insert_data")
@patch("etl.src.forecast.forecast_orchestrator.create_data_textures")
@patch("etl.src.forecast.forecast_orchestrator.insert_textures")
def test__process_forecast__correct_mocks_used(
    mock_insert_textures,
    mock_create_textures,
    mock_insert_forecast,
    mock_transform_forecast,
    mock_fetch_forecast,
):
    cities = [create_test_city("Test", 90, 90)]
    base_date = datetime(2024, 6, 1, 17, 0, 0, 0)

    forecast_data = ForecastData(single_level_data_set, multi_level_data_set)
    transformed_forecast_data = []
    textures = [
        {
            "forecast_base_time": "2024-05-24T11:12:13",
            "variable": "pm10",
            "texture_uri": "path/to/texture1",
        }
    ]

    mock_fetch_forecast.return_value = forecast_data
    mock_transform_forecast.return_value = transformed_forecast_data
    mock_create_textures.return_value = textures

    process_forecast(cities, base_date)

    mock_fetch_forecast.assert_called_with(base_date)
    mock_transform_forecast.assert_called_with(forecast_data, cities)
    mock_insert_forecast.assert_called_with(transformed_forecast_data)
    mock_create_textures.assert_called_with(forecast_data)
    mock_insert_textures.assert_called_with(textures)
