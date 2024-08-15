import os
from datetime import datetime, timedelta

import pandas as pd

from shared.src.database.in_situ import get_in_situ_dates_between


# Function to ensure each hour in a given day has at least one measurement
def ensure_one_measurement_per_hour(dates_from_db: list[datetime], potential_dates: list[datetime]):
    no_data_for_hours = []
    for potential_date in potential_dates:
        for date_from_db in dates_from_db:
            end_date = potential_date + timedelta(hours=1)
            if date_from_db >= potential_date and date_from_db < end_date:
                break
        no_data_for_hours.append(potential_date)
    return no_data_for_hours


def retrieve_past_dates_requiring_in_situ_data() -> [datetime]:
    base_date = datetime(datetime.utcnow().date().year, datetime.utcnow().date().month, datetime.utcnow().date().day - 1
                         , 0)

    base_date_env = os.environ.get("FORECAST_BASE_TIME")
    if base_date_env is not None:
        date_format = "%Y-%m-%d %H"
        base_date = datetime.strptime(base_date_env, date_format)

    forecast_retrieval_period_env = int(os.getenv("FORECAST_RETRIEVAL_PERIOD", 7))
    search_start_date = base_date - timedelta(days=forecast_retrieval_period_env)

    dates = pd.date_range(search_start_date, base_date, freq="1h")
    potential_dates = [i.to_pydatetime() for i in dates]

    dates_from_db = get_in_situ_dates_between(search_start_date, base_date)
    print("dates_from_db: " + str(dates_from_db))
    one_measurement_per_hour_list = ensure_one_measurement_per_hour(dates_from_db, potential_dates)
    print("one_measurement_per_hour_list: " + str(one_measurement_per_hour_list))
    return one_measurement_per_hour_list
