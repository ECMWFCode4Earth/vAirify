from datetime import datetime
from unittest.mock import patch

from freezegun import freeze_time

from air_quality.database.locations import AirQualityLocationType
from air_quality.etl.forecast.forecast_data import ForecastData
from scripts.run_forecast_etl import main
from tests.util.mock_forecast_data import single_level_data_set, multi_level_data_set
from tests.util.mock_location import create_test_city


cities = [create_test_city("Test", 90, 90)]
forecast_data = ForecastData(single_level_data_set, multi_level_data_set)
transformed_forecast_data = []
textures = [
    {
        "forecast_base_time": "2024-05-24T11:12:13",
        "variable": "pm10",
        "texture_uri": "path/to/texture1",
    },
    {
        "forecast_base_time": "2024-05-24T11:12:13",
        "variable": "pm2_5",
        "texture_uri": "path/to/texture2",
    },
]


@patch("scripts.run_forecast_etl.insert_data")
@patch("scripts.run_forecast_etl.transform")
@patch("scripts.run_forecast_etl.fetch_forecast_data")
@patch("scripts.run_forecast_etl.get_locations_by_type")
@patch("scripts.run_forecast_etl.create_data_textures")
@patch("scripts.run_forecast_etl.insert_textures")
@patch("os.environ.get")
@freeze_time("2024-05-24T11:12:13")
def test__run_forecast_etl__no_forecast_time_in_environment_uses_now(
    mock_os,
    mock_insert_textures,
    mock_textures,
    mock_locations,
    mock_fetch,
    mock_transform,
    mock_insert,
):
    with patch("scripts.run_forecast_etl.config.fileConfig"):
        mock_os.return_value = None
        mock_locations.return_value = cities
        mock_fetch.return_value = forecast_data
        mock_transform.return_value = transformed_forecast_data
        mock_textures.return_value = textures

        main()

        expected_datetime = datetime(2024, 5, 24, 11, 12, 13, 0)
        mock_os.assert_called_with("FORECAST_BASE_TIME")
        mock_locations.assert_called_with(AirQualityLocationType.CITY)
        mock_fetch.assert_called_with(expected_datetime)
        mock_transform.assert_called_with(forecast_data, cities)
        mock_insert.assert_called_with(transformed_forecast_data)
        mock_textures.assert_called_with(forecast_data)
        mock_insert_textures.assert_called_with(textures)


@patch("scripts.run_forecast_etl.insert_data")
@patch("scripts.run_forecast_etl.transform")
@patch("scripts.run_forecast_etl.fetch_forecast_data")
@patch("scripts.run_forecast_etl.get_locations_by_type")
@patch("scripts.run_forecast_etl.create_data_textures")
@patch("scripts.run_forecast_etl.insert_textures")
@patch("os.environ.get")
@freeze_time("2024-05-24T11:12:13")
def test__run_forecast_etl__forecast_time_in_environment_uses(
    mock_os,
    mock_insert_textures,
    mock_textures,
    mock_locations,
    mock_fetch,
    mock_transform,
    mock_insert,
):
    with patch("scripts.run_forecast_etl.config.fileConfig"):
        mock_os.return_value = "2024-06-01 17"
        mock_locations.return_value = cities
        mock_fetch.return_value = forecast_data
        mock_transform.return_value = transformed_forecast_data
        mock_textures.return_value = textures

        main()

        expected_datetime = datetime(2024, 6, 1, 17, 0, 0, 0)
        mock_os.assert_called_with("FORECAST_BASE_TIME")
        mock_locations.assert_called_with(AirQualityLocationType.CITY)
        mock_fetch.assert_called_with(expected_datetime)
        mock_transform.assert_called_with(forecast_data, cities)
        mock_insert.assert_called_with(transformed_forecast_data)
        mock_textures.assert_called_with(forecast_data)
        mock_insert_textures.assert_called_with(textures)
