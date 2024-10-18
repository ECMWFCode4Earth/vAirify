import os
from datetime import datetime, timedelta

import pandas as pd

from shared.src.database.in_situ import get_in_situ_dates_between


def dates_without_measurements(
        dates_from_db: list[datetime],
        potential_dates: list[datetime]):
    date_without_measurement = []
    for potential_date in potential_dates:
        for hour in range(0, 23):
            if date_without_measurement.__contains__(potential_date):
                break

            start_date = potential_date - timedelta(hours=hour + 1)
            end_date = potential_date - timedelta(hours=hour)

            found = False
            for date_from_db in dates_from_db:
                if start_date <= date_from_db < end_date:
                    found = True
                    break

            if not found:
                date_without_measurement.append(potential_date)

    return date_without_measurement


#
# Function to retrieve dates requiring in-situ data.
# This always retrieves the current date and time
# It also looks back at all 24 hour periods within the in situ retrieval period
# (default 7 days). In any given 24-hour period if there are any hour slots that do not
# have any data at all, that period is returned.
#
def retrieve_dates_requiring_in_situ_data() -> [datetime]:
    in_situ_retrieval_period = int(os.getenv("IN_SITU_RETRIEVAL_PERIOD", 14))

    cur_date = datetime.utcnow()
    search_end_date = cur_date - timedelta(days=1)
    search_start_date = cur_date - timedelta(days=in_situ_retrieval_period)

    if search_end_date <= search_start_date:
        return [cur_date]

    dates = pd.date_range(search_start_date,
                          search_end_date,
                          inclusive="right",
                          freq="24h")
    potential_dates = [i.to_pydatetime() for i in dates]

    dates_from_db = get_in_situ_dates_between(search_start_date, search_end_date)
    dates_requiring_in_situ_data = dates_without_measurements(
        dates_from_db,
        potential_dates)

    dates_requiring_in_situ_data.append(cur_date)

    return dates_requiring_in_situ_data
