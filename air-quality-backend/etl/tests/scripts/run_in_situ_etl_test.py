import os
from datetime import datetime
from unittest.mock import patch

from shared.src.database.locations import AirQualityLocationType
from etl.scripts.run_in_situ_etl import main
from shared.tests.util.mock_location import create_test_city

cities = [
    create_test_city("Test_City_1", 90, 90),
    create_test_city("Test_City_2", 100, 100),
    create_test_city("Test_City_3", 110, 110),
    create_test_city("Test_City_4", 120, 120),
]
in_situ_data = {"London": {"measurements": [], "city": cities[0]}}


@patch("etl.scripts.run_in_situ_etl.insert_data")
@patch("etl.scripts.run_in_situ_etl.retrieve_openaq_in_situ_data")
@patch("etl.scripts.run_in_situ_etl.retrieve_dates_requiring_in_situ_data")
@patch("etl.scripts.run_in_situ_etl.get_locations_by_type")
def test__run_in_situ_etl__one_date_no_cities_override(
    mock_locations, mock_dates, mock_fetch, mock_insert
):

    mock_dates.return_value = [datetime(2024, 6, 5)]
    mock_locations.return_value = cities
    mock_fetch.return_value = in_situ_data

    main()

    mock_locations.assert_called_with(AirQualityLocationType.CITY)
    mock_fetch.assert_called_with(cities, datetime(2024, 6, 5), 24)
    mock_insert.assert_called_with(in_situ_data)


@patch("etl.scripts.run_in_situ_etl.insert_data")
@patch("etl.scripts.run_in_situ_etl.retrieve_openaq_in_situ_data")
@patch("etl.scripts.run_in_situ_etl.retrieve_dates_requiring_in_situ_data")
@patch("etl.scripts.run_in_situ_etl.get_locations_by_type")
def test__run_in_situ_etl__multiple_dates_no_cities_override(
    mock_locations, mock_dates, mock_fetch, mock_insert
):

    mock_dates.return_value = [
        datetime(2024, 6, 3),
        datetime(2024, 6, 4),
        datetime(2024, 6, 5),
    ]
    mock_locations.return_value = cities
    mock_fetch.return_value = in_situ_data

    main()

    mock_locations.assert_called_with(AirQualityLocationType.CITY)
    mock_fetch.assert_any_call(cities, datetime(2024, 6, 3), 24)
    mock_fetch.assert_any_call(cities, datetime(2024, 6, 4), 24)
    mock_fetch.assert_any_call(cities, datetime(2024, 6, 5), 24)
    mock_insert.assert_called_with(in_situ_data)


@patch("etl.scripts.run_in_situ_etl.insert_data")
@patch("etl.scripts.run_in_situ_etl.retrieve_openaq_in_situ_data")
@patch("etl.scripts.run_in_situ_etl.retrieve_dates_requiring_in_situ_data")
@patch("etl.scripts.run_in_situ_etl.get_locations_by_type")
@patch.dict(os.environ, {"OPEN_AQ_CITIES": "Test_City_2,Test_City_4"})
def test__run_in_situ_etl__one_date_with_cities_override_filters(
    mock_locations, mock_dates, mock_fetch, mock_insert
):

    mock_dates.return_value = [datetime(2024, 6, 5)]
    mock_locations.return_value = cities
    mock_fetch.return_value = in_situ_data

    main()

    expected_cities = [cities[1], cities[3]]
    mock_locations.assert_called_with(AirQualityLocationType.CITY)
    mock_fetch.assert_called_with(expected_cities, datetime(2024, 6, 5), 24)
    mock_insert.assert_called_with(in_situ_data)
