import logging
import os
from logging import config

from dotenv import load_dotenv

from etl.src.in_situ.openaq_date_retriever import retrieve_dates_requiring_in_situ_data
from etl.src.in_situ.openaq_orchestrator import retrieve_openaq_in_situ_data
from shared.src.database.in_situ import insert_data
from shared.src.database.locations import get_locations_by_type, AirQualityLocationType

config.fileConfig("./logging.ini")


def main():
    load_dotenv()

    cities = get_locations_by_type(AirQualityLocationType.CITY)

    open_aq_cities = (
        os.environ["OPEN_AQ_CITIES"] if "OPEN_AQ_CITIES" in os.environ else None
    )
    if open_aq_cities is not None:
        cities = [city for city in cities if city["name"] in open_aq_cities.split(",")]
    logging.info(f"Finding data for {cities.__len__()} cities")

    in_situ_dates = retrieve_dates_requiring_in_situ_data()

    for date in in_situ_dates:
        logging.info(f"Finding in-situ data for the 24 hour period before {date}")

        open_aq_data = retrieve_openaq_in_situ_data(cities, date, 24)
        insert_data(open_aq_data)


if __name__ == "__main__":
    main()
