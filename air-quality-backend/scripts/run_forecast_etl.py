import logging
import os
from logging import config

from dotenv import load_dotenv
from datetime import datetime
from air_quality.database.forecasts import insert_data
from air_quality.database.locations import get_locations_by_type, AirQualityLocationType
from air_quality.etl.forecast.forecast_adapter import transform
from air_quality.etl.forecast.forecast_dao import fetch_forecast_data

config.fileConfig("./logging.ini")


def main():
    load_dotenv()

    cities = get_locations_by_type(AirQualityLocationType.CITY)
    logging.info(f"Finding data for {cities.__len__()} cities")

    base_date = datetime.utcnow()
    base_date_env = os.environ.get("FORECAST_BASE_TIME")
    if base_date_env is not None:
        date_format = "%Y-%m-%d %H"
        base_date = datetime.strptime(base_date_env, date_format)

    logging.info("Extracting pollutant forecast data")
    extracted_forecast_data = fetch_forecast_data(base_date)

    logging.info("Transforming forecast data")
    transformed_forecast_data = transform(extracted_forecast_data, cities)

    logging.info("Persisting forecast data")
    insert_data(transformed_forecast_data)


if __name__ == "__main__":
    main()
