from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging
from logging import config
from src.database.forecasts import delete_data_before as delete_forecast_data
from src.database.in_situ import delete_data_before as delete_in_situ_data

config.fileConfig("../logging.ini")


def main():
    load_dotenv()

    ten_days_previous = datetime.now() - timedelta(days=10)

    logging.info(f"Purging data earlier than {ten_days_previous}")
    delete_forecast_data(ten_days_previous)
    delete_in_situ_data(ten_days_previous)


if __name__ == "__main__":
    main()
