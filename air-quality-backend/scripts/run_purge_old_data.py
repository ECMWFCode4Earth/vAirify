from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging
from logging import config
from air_quality.database.forecasts import delete_data_before as delete_forecast_data
from air_quality.database.in_situ import delete_data_before as delete_in_situ_data

config.fileConfig("./logging.ini")


def main():
    load_dotenv()

#TODO - Undo
    previous = datetime.now()

    logging.info(f"Purging data earlier than {previous}")
    #delete_forecast_data(ten_days_previous)
    delete_in_situ_data(previous)


if __name__ == "__main__":
    main()
