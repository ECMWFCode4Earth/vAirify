import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging
from logging import config
from shared.src.database.forecasts import (
    delete_forecast_data_before, delete_data_texture_data_before)
from shared.src.database.in_situ import delete_data_before as delete_in_situ_data

config.fileConfig("./logging.ini")


def main():
    load_dotenv()

    archive_limit_weeks = int(os.getenv("ARCHIVE_LIMIT_WEEKS", 0))

    if archive_limit_weeks == 0:
        logging.warning('Archiving has not received a valid limit so will not run')
        return

    initial_valid_date = datetime.now() - timedelta(weeks=archive_limit_weeks)

    logging.info(f"Archiving data earlier than {initial_valid_date}")
    delete_forecast_data_before(initial_valid_date)
    delete_in_situ_data(initial_valid_date)
    delete_data_texture_data_before(initial_valid_date)


if __name__ == "__main__":
    main()
