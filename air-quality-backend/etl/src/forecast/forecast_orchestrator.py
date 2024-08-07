from datetime import datetime
import logging

from etl.src.forecast.forecast_adapter import transform, create_data_textures
from etl.src.forecast.forecast_dao import fetch_forecast_data
from shared.src.database.forecasts import insert_data, insert_textures
from shared.src.database.locations import AirQualityLocation


def process_forecast(cities: list[AirQualityLocation], base_date: datetime):
    base_date_str = base_date.strftime("%Y-%m-%d %H:%M:%S")

    logging.info(f"Extracting pollutant forecast data for base date {base_date_str}")
    extracted_forecast_data = fetch_forecast_data(base_date)

    logging.info(f"Transforming forecast data for base date {base_date_str}")
    transformed_forecast_data = transform(extracted_forecast_data, cities)

    logging.info(f"Persisting forecast data for base date {base_date_str}")
    insert_data(transformed_forecast_data)

    logging.info(f"Creating forecast data textures for base date {base_date_str}")
    textures = create_data_textures(extracted_forecast_data)

    logging.info(f"Persisting forecast data textures for base date {base_date_str}")
    insert_textures(textures)
