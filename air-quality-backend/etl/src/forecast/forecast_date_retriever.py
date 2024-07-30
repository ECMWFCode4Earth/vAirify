import os
from datetime import datetime


def retrieve_dates_requiring_forecast():
    base_date = datetime.utcnow()
    base_date_env = os.environ.get("FORECAST_BASE_TIME")
    if base_date_env is not None:
        date_format = "%Y-%m-%d %H"
        base_date = datetime.strptime(base_date_env, date_format)

    forecast_retrieval_period = os.environ.get("FORECAST_RETRIEVAL_PERIOD", "7")


    # retrieve any dates in the database that have no forecast data

    return [base_date]