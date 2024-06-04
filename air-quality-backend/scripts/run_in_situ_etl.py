from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging
from logging import config
from air_quality.database.locations import get_locations_by_type
from air_quality.database.in_situ import insert_data
from air_quality.etl.in_situ.openaq_orchestrator import retrieve_openaq_in_situ_data

config.fileConfig("./logging.ini")


def main():
    load_dotenv()

    cities = get_locations_by_type("city")
    # TODO - Undo
    cities = cities[3:4]

    logging.info(f"Finding data for {cities.__len__()} cities")

    hours_to_query = 12
    end_date = datetime.now()-timedelta(days=4)

    logging.info("Retrieving Open AQ in situ data")
    open_aq_data = retrieve_openaq_in_situ_data(cities, end_date, hours_to_query)

    logging.info("Persisting open AQ in situ data")
    insert_data(open_aq_data)

if __name__ == "__main__":
    main()
