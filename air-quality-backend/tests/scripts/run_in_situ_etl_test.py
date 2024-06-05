from datetime import datetime
from unittest.mock import patch

from freezegun import freeze_time

from air_quality.database.locations import AirQualityLocationType
from scripts.run_in_situ_etl import main
from tests.util.mock_location import create_test_city

cities = [create_test_city("Test", 90, 90)]
in_situ_data = {"London": {"measurements": [], "city": cities[0]}}
transformed_in_situ_data = []


@patch("scripts.run_in_situ_etl.insert_data")
@patch("scripts.run_in_situ_etl.transform")
@patch("scripts.run_in_situ_etl.fetch_in_situ_measurements")
@patch("scripts.run_in_situ_etl.get_locations_by_type")
@freeze_time("2024-06-05")
def test__run_in_situ_etl(mock_locations, mock_fetch, mock_transform, mock_insert):
    with patch("scripts.run_forecast_etl.config.fileConfig"):
        mock_locations.return_value = cities
        mock_fetch.return_value = in_situ_data
        mock_transform.return_value = transformed_in_situ_data

        main()

        mock_locations.assert_called_with(AirQualityLocationType.CITY)
        mock_fetch.assert_called_with(
            cities, date_from=datetime(2024, 6, 4), date_to=datetime(2024, 6, 5)
        )
        mock_transform.assert_called_with(in_situ_data)
        mock_insert.assert_called_with(transformed_in_situ_data)
