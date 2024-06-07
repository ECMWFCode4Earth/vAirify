from unittest.mock import patch

from air_quality.database.locations import AirQualityLocationType
from air_quality.etl.forecast.forecast_data import ForecastData
from scripts.run_forecast_etl import main
from tests.util.mock_forecast_data import single_level_data_set, multi_level_data_set
from tests.util.mock_location import create_test_city


cities = [create_test_city("Test", 90, 90)]
forecast_data = ForecastData(single_level_data_set, multi_level_data_set)
transformed_forecast_data = []


@patch("scripts.run_forecast_etl.insert_data")
@patch("scripts.run_forecast_etl.transform")
@patch("scripts.run_forecast_etl.fetch_forecast_data")
@patch("scripts.run_forecast_etl.get_locations_by_type")
def test__run_forecast_etl(mock_locations, mock_fetch, mock_transform, mock_insert):
    with patch("scripts.run_forecast_etl.config.fileConfig"):
        mock_locations.return_value = cities
        mock_fetch.return_value = forecast_data
        mock_transform.return_value = transformed_forecast_data

        main()

        mock_locations.assert_called_with(AirQualityLocationType.CITY)
        mock_fetch.assert_called()
        mock_transform.assert_called_with(forecast_data, cities)
        mock_insert.assert_called_with(transformed_forecast_data)