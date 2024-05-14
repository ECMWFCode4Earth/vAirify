from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging
from logging import config
from src.etl.database.air_quality_dashboard_dao import (
    get_locations_by_type,
    insert_data_forecast,
    insert_data_openaq,
)
from src.etl.forecast.forecast_dao import fetch_forecast_data
from src.etl.forecast.forecast_adapter import transform
from src.etl.in_situ.openaq_dao import fetch_in_situ_measurements
from src.etl.in_situ.openaq_adapter import transform_in_situ_data

config.fileConfig("logging.ini")


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

    logging.info("Extracting in situ pollutant data")
    in_situ_measurements_by_city = fetch_in_situ_measurements(
        cities, date_from=today - timedelta(days=1), date_to=today
    )

    logging.info("Transforming in situ data")
    transformed_in_situ_data = transform_in_situ_data(in_situ_measurements_by_city)

    logging.info("Persisting in situ data")
    insert_data_openaq(transformed_in_situ_data)


if __name__ == "__main__":
    main()
