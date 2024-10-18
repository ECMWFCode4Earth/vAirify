import os
from datetime import datetime, timedelta

import pandas as pd

from shared.src.database.forecasts import get_forecast_dates_between


def retrieve_dates_requiring_forecast() -> [datetime]:
    base_date = datetime.utcnow()
    base_date_env = os.environ.get("FORECAST_BASE_TIME")
    if base_date_env is not None:
        date_format = "%Y-%m-%d %H"
        base_date = datetime.strptime(base_date_env, date_format)

    base_date = align_to_cams_publish_time(base_date)

    forecast_retrieval_period_env = int(os.getenv("FORECAST_RETRIEVAL_PERIOD", 14))
    search_start_date = base_date - timedelta(days=forecast_retrieval_period_env)

    dates = pd.date_range(search_start_date, base_date, freq="12h")
    potential_dates = [i.to_pydatetime() for i in dates]

    stored_dates = get_forecast_dates_between(search_start_date, base_date)

    return list(set(potential_dates) - set(stored_dates))


def align_to_cams_publish_time(forecast_base_time: datetime) -> datetime:
    now = datetime.utcnow()
    if forecast_base_time > now:
        raise ValueError("forecast base data cannot be in the future")

    request_for_today = forecast_base_time.date() == now.date()

    current_hour = int(now.strftime("%H"))
    requested_hour = int(forecast_base_time.strftime("%H"))

    if request_for_today:
        if 0 <= current_hour < 10:
            # If asking before 10am, only yesterdays is available
            forecast_base_time -= timedelta(days=1)
            hour = 12
        elif requested_hour >= 12 and current_hour >= 22:
            # If requesting post midday data, it must be past 10pm
            hour = 12
        else:
            # Either the request was for morning data, or that's all that is available
            hour = 0
    else:
        if requested_hour < 12:
            hour = 0
        else:
            hour = 12

    return datetime(
        forecast_base_time.year, forecast_base_time.month, forecast_base_time.day, hour
    )
