from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging
from logging import config

from src.database.air_quality_dashboard_dao import delete_data_before

config.fileConfig("../logging.ini")


def main():
    load_dotenv()

    ten_days_previous = datetime.now() - timedelta(days=10)

    logging.info(f"Purging data earlier than {ten_days_previous}")
    delete_data_before(ten_days_previous)


if __name__ == "__main__":
    main()
