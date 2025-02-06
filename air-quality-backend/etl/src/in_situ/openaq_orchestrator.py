import logging
import math
from multiprocessing.pool import ThreadPool
import time

from datetime import datetime, timedelta

from shared.src.database.in_situ import InSituMeasurement
from ..forecast.forecast_dao import (
    fetch_forecast_data,
    CAMS_FORECAST_INTERVAL_HOURS,
)
from .openaq_dao import fetch_in_situ_measurements, rate_limiter
from .openaq_adapter import (
    transform_city,
    enrich_with_forecast_data,
)


def retrieve_openaq_in_situ_data(
    cities, end_date: datetime, period_hours
) -> list[InSituMeasurement]:
    start_time = time.time()  # Start timing
    start_date = end_date - timedelta(hours=period_hours)

    pool = ThreadPool(processes=2)

    async_in_situ_data = pool.apply_async(
        get_in_situ_data, (cities, start_date, end_date)
    )
    async_forecast_data = pool.apply_async(
        get_forecast_data, (start_date, period_hours)
    )

    in_situ_measurements_by_city = async_in_situ_data.get()
    extracted_forecast_data = async_forecast_data.get()

    logging.info("Transforming in situ data")
    transformed_in_situ_data = []
    for city_name, city_data in in_situ_measurements_by_city.items():
        logging.debug(f"Transforming in situ data for city: {city_name}")
        transformed_city_data = transform_city(city_data)
        enriched_city_data = enrich_with_forecast_data(
            transformed_city_data, extracted_forecast_data
        )
        transformed_in_situ_data.extend(enriched_city_data)

    # Log metrics at the end
    processing_time = time.time() - start_time
    api_calls = rate_limiter.get_api_calls()  # Get total API calls from rate limiter
    logging.info(
        f"OpenAQ ETL completed - "
        f"Total API calls: {api_calls}, "
        f"Processing time: {processing_time:.2f} seconds"
    )

    return transformed_in_situ_data


def get_in_situ_data(cities, start_date, end_date):
    logging.info(
        f"Extracting in situ pollutant data between "
        f"{start_date.strftime('%Y-%m-%d_%H:%M')} and "
        f"{end_date.strftime('%Y-%m-%d_%H:%M')}"
    )
    in_situ_measurements_by_city = fetch_in_situ_measurements(
        cities, start_date, end_date
    )

    logging.info("Extracting in situ pollutant data complete")
    return in_situ_measurements_by_city


def get_forecast_data(start_date, period_hours):
    logging.info("Extracting CAMs forecast data")
    no_of_forecasts = math.ceil((period_hours + 24) / CAMS_FORECAST_INTERVAL_HOURS)
    extracted_forecast_data = fetch_forecast_data(start_date, no_of_forecasts)

    logging.info("Extracting CAMs forecast data complete")
    return extracted_forecast_data
