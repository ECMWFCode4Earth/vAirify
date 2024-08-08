import os
import datetime
from unittest.mock import patch

from freezegun import freeze_time

from etl.scripts.run_archive_old_data import main


@patch("etl.scripts.run_archive_old_data.delete_forecast_data_before")
@patch("etl.scripts.run_archive_old_data.delete_in_situ_data_before")
@patch("etl.scripts.run_archive_old_data.delete_data_texture_data_before")
@patch("etl.scripts.run_archive_old_data.delete_data_textures_before")
@patch.dict(os.environ, {"ARCHIVE_LIMIT_WEEKS": "0"})
def test__run_forecast_etl__no_limit_returns_without_processing(
    mock_delete_data_textures_before,
    mock_delete_data_texture_data_before,
    mock_delete_in_situ_data_before,
    mock_delete_forecast_data_before,
):
    main()

    mock_delete_forecast_data_before.assert_not_called()
    mock_delete_in_situ_data_before.assert_not_called()
    mock_delete_data_texture_data_before.assert_not_called()
    mock_delete_data_textures_before.assert_not_called()


@patch("etl.scripts.run_archive_old_data.delete_forecast_data_before")
@patch("etl.scripts.run_archive_old_data.delete_in_situ_data_before")
@patch("etl.scripts.run_archive_old_data.delete_data_texture_data_before")
@patch("etl.scripts.run_archive_old_data.delete_data_textures_before")
@patch.dict(os.environ, {"ARCHIVE_LIMIT_WEEKS": "-1"})
def test__run_forecast_etl__negative_limit_returns_without_processing(
    mock_delete_data_textures_before,
    mock_delete_data_texture_data_before,
    mock_delete_in_situ_data_before,
    mock_delete_forecast_data_before,
):
    main()

    mock_delete_forecast_data_before.assert_not_called()
    mock_delete_in_situ_data_before.assert_not_called()
    mock_delete_data_texture_data_before.assert_not_called()
    mock_delete_data_textures_before.assert_not_called()


@patch("etl.scripts.run_archive_old_data.delete_forecast_data_before")
@patch("etl.scripts.run_archive_old_data.delete_in_situ_data_before")
@patch("etl.scripts.run_archive_old_data.delete_data_texture_data_before")
@patch("etl.scripts.run_archive_old_data.delete_data_textures_before")
@patch.dict(os.environ, {"ARCHIVE_LIMIT_WEEKS": "3"})
@freeze_time("2024-08-07")
def test__run_forecast_etl__positive_limit_processes_successfully(
    mock_delete_data_textures_before,
    mock_delete_data_texture_data_before,
    mock_delete_in_situ_data_before,
    mock_delete_forecast_data_before,
):
    expected_date = datetime.datetime(2024, 7, 17)

    main()

    mock_delete_forecast_data_before.assert_called_with(expected_date)
    mock_delete_in_situ_data_before.assert_called_with(expected_date)
    mock_delete_data_texture_data_before.assert_called_with(expected_date)
    mock_delete_data_textures_before.assert_called_with(expected_date)
