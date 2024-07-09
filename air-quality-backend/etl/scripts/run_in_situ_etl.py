import logging
import os

from datetime import datetime
from logging import config

from dotenv import load_dotenv

from shared.src.database.in_situ import insert_data
from shared.src.database.locations import get_locations_by_type, AirQualityLocationType
from etl.src.in_situ.openaq_orchestrator import retrieve_openaq_in_situ_data

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

    hours_to_query = 24
    end_date = datetime.utcnow()

    logging.info("Retrieving Open AQ in situ data")
    open_aq_data = retrieve_openaq_in_situ_data(cities, end_date, hours_to_query)

    logging.info("Persisting open AQ in situ data")
    insert_data(open_aq_data)


if __name__ == "__main__":
    main()
