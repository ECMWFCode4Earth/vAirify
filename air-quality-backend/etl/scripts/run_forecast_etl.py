import logging

from logging import config

from dotenv import load_dotenv
from etl.src.forecast.forecast_date_retriever import retrieve_dates_requiring_forecast
from etl.src.forecast.forecast_orchestrator import process_forecast
from shared.src.database.locations import get_locations_by_type, AirQualityLocationType

config.fileConfig("./logging.ini")


def main():
    load_dotenv()

    cities = get_locations_by_type(AirQualityLocationType.CITY)
    logging.info(f"Finding data for {cities.__len__()} cities")

    base_dates = retrieve_dates_requiring_forecast()

    for base_date in base_dates:
        process_forecast(cities, base_date)


if __name__ == "__main__":
    main()
