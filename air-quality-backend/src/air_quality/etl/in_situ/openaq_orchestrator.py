import logging
import math

from datetime import datetime, timedelta
from air_quality.etl.forecast.forecast_dao import fetch_forecast_data, CAMS_FORECAST_INTERVAL_HOURS, \
    CAMS_UPDATE_INTERVAL_HOURS
from air_quality.etl.in_situ.openaq_dao import fetch_in_situ_measurements
from air_quality.etl.in_situ.openaq_adapter import transform


def retrieve_openaq_in_situ_data(cities, end_date: datetime, period_hours):

    start_date = end_date - timedelta(hours=period_hours)

    date_format = '%Y-%m-%d_%H:%M'
    start_date_str = start_date.strftime(date_format)
    end_date_str = end_date.strftime(date_format)

    logging.info(f"Extracting in situ pollutant data between {start_date_str} and {end_date_str}")
    in_situ_measurements_by_city = fetch_in_situ_measurements(cities, start_date, end_date)

    logging.info("Extracting CAMs forecast data")
    no_of_forecasts = math.ceil((period_hours + CAMS_UPDATE_INTERVAL_HOURS) / CAMS_FORECAST_INTERVAL_HOURS)
    extracted_forecast_data = fetch_forecast_data(start_date, no_of_forecasts)

    logging.info("Transforming in situ data")
    transformed_in_situ_data = transform(in_situ_measurements_by_city)

    return transformed_in_situ_data
