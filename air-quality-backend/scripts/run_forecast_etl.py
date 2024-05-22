from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
from itertools import chain
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

    logging.info("Extracting pollutant forecast data")
    extracted_forecast_data = fetch_forecast_data()

    logging.info("Transforming forecast data")
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(transform, extracted_forecast_data, city) for city in cities
        ]
        results = [future.result() for future in futures]
    transformed_forecast_data = list(chain.from_iterable(results))

    logging.info("Persisting forecast data")
    insert_data_forecast(transformed_forecast_data)


if __name__ == "__main__":
    main()
