import logging
import math

from datetime import datetime, timedelta
from air_quality.etl.forecast.forecast_dao import (
    fetch_forecast_data,
    CAMS_FORECAST_INTERVAL_HOURS,
)
from air_quality.etl.in_situ.openaq_dao import fetch_in_situ_measurements
from air_quality.etl.in_situ.openaq_adapter import (
    transform_city,
    enrich_with_forecast_data,
)


def retrieve_openaq_in_situ_data(cities, end_date: datetime, period_hours):

    start_date = end_date - timedelta(hours=period_hours)

    logging.info(
        f"Extracting in situ pollutant data between "
        f"{start_date.strftime('%Y-%m-%d_%H:%M')} and "
        f"{end_date.strftime('%Y-%m-%d_%H:%M')}"
    )
    in_situ_measurements_by_city = fetch_in_situ_measurements(
        cities, start_date, end_date
    )

    logging.info("Extracting CAMs forecast data")
    no_of_forecasts = math.ceil((period_hours + 24) / CAMS_FORECAST_INTERVAL_HOURS)
    extracted_forecast_data = fetch_forecast_data(start_date, no_of_forecasts)

    logging.info("Transforming in situ data")
    transformed_in_situ_data = []
    for city_name, city_data in in_situ_measurements_by_city.items():
        transformed_city_data = transform_city(city_name, city_data)
        transformed_city_data = enrich_with_forecast_data(
            transformed_city_data, extracted_forecast_data
        )
        transformed_in_situ_data.extend(transformed_city_data)

    logging.info("Transforming in situ data complete")
    return transformed_in_situ_data
