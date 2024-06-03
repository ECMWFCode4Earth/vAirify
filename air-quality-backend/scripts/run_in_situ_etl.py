import logging
from datetime import datetime, timedelta
from logging import config

from dotenv import load_dotenv

from air_quality.database.in_situ import insert_data
from air_quality.database.locations import get_locations_by_type, AirQualityLocationType
from air_quality.etl.in_situ.openaq_adapter import transform
from air_quality.etl.in_situ.openaq_dao import fetch_in_situ_measurements

config.fileConfig("./logging.ini")


def main():
    load_dotenv()

    cities = get_locations_by_type(AirQualityLocationType.CITY)
    logging.info(f"Finding data for {cities.__len__()} cities")

    today = datetime.now()

    logging.info("Extracting in situ pollutant data")
    in_situ_measurements_by_city = fetch_in_situ_measurements(
        cities, date_from=today - timedelta(days=5), date_to=today - timedelta(days=4)
    )

    logging.info("Transforming in situ data")
    transformed_in_situ_data = transform(in_situ_measurements_by_city)

    logging.info("Persisting in situ data")
    insert_data(transformed_in_situ_data)


if __name__ == "__main__":
    main()
