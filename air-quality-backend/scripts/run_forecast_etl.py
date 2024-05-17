from datetime import datetime
from dotenv import load_dotenv
import logging
from logging import config

from src.database.air_quality_dashboard_dao import (
    get_locations_by_type,
    insert_data_forecast,
)
from src.etl.forecast.forecast_dao import fetch_forecast_data
from src.etl.forecast.forecast_adapter import transform

config.fileConfig("../logging.ini")


def main():
    load_dotenv()

    cities = get_locations_by_type("city")
    logging.info(f"Finding data for {cities.__len__()} cities")

    today = datetime.now()

    logging.info("Extracting pollutant forecast data")
    extracted_forecast_data = fetch_forecast_data(model_base_date=today)

    logging.info("Transforming forecast data")
    transformed_forecast_data = transform(extracted_forecast_data, cities)

    logging.info("Persisting forecast data")
    insert_data_forecast(transformed_forecast_data)


if __name__ == "__main__":
    main()
