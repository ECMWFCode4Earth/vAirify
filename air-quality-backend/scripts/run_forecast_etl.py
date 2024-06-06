import os

from dotenv import load_dotenv
import logging
from logging import config
from air_quality.database.locations import get_locations_by_type
from air_quality.database.forecasts import insert_data
from air_quality.etl.forecast.forecast_dao import fetch_forecast_data, CamsModelDateTime
from air_quality.etl.forecast.forecast_adapter import transform

config.fileConfig("./logging.ini")


def main():
    load_dotenv()

    cities = get_locations_by_type("city")
    logging.info(f"Finding data for {cities.__len__()} cities")

    logging.info("Extracting pollutant forecast data")
    model_base_time = None
    if (
        os.environ.get("FORECAST_BASE_DATE") is not None
        and os.environ.get("FORECAST_BASE_TIME") is not None
    ):
        model_base_time = CamsModelDateTime(
            os.environ.get("FORECAST_BASE_DATE"), os.environ.get("FORECAST_BASE_TIME")
        )

    extracted_forecast_data = fetch_forecast_data(model_base_time)

    logging.info("Transforming forecast data")
    transformed_forecast_data = transform(extracted_forecast_data, cities)

    logging.info("Persisting forecast data")
    insert_data(transformed_forecast_data)


if __name__ == "__main__":
    main()
