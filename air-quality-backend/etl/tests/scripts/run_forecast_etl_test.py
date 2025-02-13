from datetime import datetime
from unittest.mock import patch

from etl.scripts.run_forecast_etl import main
from shared.tests.util.mock_location import create_test_city


cities = [create_test_city("Test", 90, 90)]


@patch("etl.scripts.run_forecast_etl.get_locations_by_type")
@patch("etl.scripts.run_forecast_etl.retrieve_dates_requiring_forecast")
@patch("etl.scripts.run_forecast_etl.process_forecast")
def test__run_forecast_etl__no_dates_returns_without_processing(
    mock_process_forecast, mock_get_dates, mock_get_locations
):
    mock_get_locations.return_value = cities
    mock_get_dates.return_value = []

    main()

    mock_process_forecast.assert_not_called()


@patch("etl.scripts.run_forecast_etl.get_locations_by_type")
@patch("etl.scripts.run_forecast_etl.retrieve_dates_requiring_forecast")
@patch("etl.scripts.run_forecast_etl.process_forecast")
def test__run_forecast_etl__single_date_processed(
    mock_process_forecast, mock_get_dates, mock_get_locations
):
    single_date = datetime(2024, 6, 1, 17, 0, 0, 0)

    mock_get_locations.return_value = cities
    mock_get_dates.return_value = [single_date]

    main()

    mock_process_forecast.assert_called_with(cities, single_date)


@patch("etl.scripts.run_forecast_etl.get_locations_by_type")
@patch("etl.scripts.run_forecast_etl.retrieve_dates_requiring_forecast")
@patch("etl.scripts.run_forecast_etl.process_forecast")
def test__run_forecast_etl__multiple_dates_processed(
    mock_process_forecast, mock_get_dates, mock_get_locations
):
    multi_date_1 = datetime(2024, 6, 1, 17, 0, 0, 0)
    multi_date_2 = datetime(2024, 6, 2, 18, 0, 0, 0)
    multi_date_3 = datetime(2024, 6, 3, 19, 0, 0, 0)

    mock_get_locations.return_value = cities
    mock_get_dates.return_value = [multi_date_1, multi_date_2, multi_date_3]

    main()

    mock_process_forecast.assert_any_call(cities, multi_date_1)
    mock_process_forecast.assert_any_call(cities, multi_date_2)
    mock_process_forecast.assert_any_call(cities, multi_date_3)
