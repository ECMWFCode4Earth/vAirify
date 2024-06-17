import os
from datetime import datetime
from unittest.mock import patch

from freezegun import freeze_time

from air_quality.database.locations import AirQualityLocationType
from scripts.run_in_situ_etl import main
from tests.util.mock_location import create_test_city

cities = [
    create_test_city("Test_City_1", 90, 90),
    create_test_city("Test_City_2", 100, 100),
    create_test_city("Test_City_3", 110, 110),
    create_test_city("Test_City_4", 120, 120),
]
in_situ_data = {"London": {"measurements": [], "city": cities[0]}}


@patch("scripts.run_in_situ_etl.insert_data")
@patch("scripts.run_in_situ_etl.retrieve_openaq_in_situ_data")
@patch("scripts.run_in_situ_etl.get_locations_by_type")
@freeze_time("2024-06-05")
def test__run_in_situ_etl__no_cities_override(mock_locations, mock_fetch, mock_insert):
    with patch("scripts.run_forecast_etl.config.fileConfig"):
        mock_locations.return_value = cities
        mock_fetch.return_value = in_situ_data

        main()

        mock_locations.assert_called_with(AirQualityLocationType.CITY)
        mock_fetch.assert_called_with(cities, datetime(2024, 6, 5), 24)
        mock_insert.assert_called_with(in_situ_data)


@patch("scripts.run_in_situ_etl.insert_data")
@patch("scripts.run_in_situ_etl.retrieve_openaq_in_situ_data")
@patch("scripts.run_in_situ_etl.get_locations_by_type")
@patch.dict(os.environ, {"OPEN_AQ_CITIES": "Test_City_2,Test_City_4"})
@freeze_time("2024-06-05")
def test__run_in_situ_etl__with_cities_override_filters(
    mock_locations, mock_fetch, mock_insert
):
    with patch("scripts.run_forecast_etl.config.fileConfig"):
        mock_locations.return_value = cities
        mock_fetch.return_value = in_situ_data

        main()

        expected_cities = [cities[1], cities[3]]
        mock_locations.assert_called_with(AirQualityLocationType.CITY)
        mock_fetch.assert_called_with(expected_cities, datetime(2024, 6, 5), 24)
        mock_insert.assert_called_with(in_situ_data)
