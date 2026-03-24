import datetime
from dotenv import load_dotenv

from etl.scripts.run_forecast_etl import main
import os
from unittest import mock

from system_tests.utils.database_utilities import (
    delete_database_data,
    get_database_data,
)

load_dotenv()


@mock.patch.dict(
    os.environ,
    {
        "FORECAST_BASE_TIME": "2024-6-4 00",
        "STORE_GRIB_FILES": "True",
        "FORECAST_RETRIEVAL_PERIOD": "1",
    },
)
def test__missing_time_london__add_missing_data():
    data_query = {
        "forecast_base_time": {
            "$lte": datetime.datetime(2024, 6, 4, 00, tzinfo=datetime.timezone.utc),
            "$gte": datetime.datetime(2024, 6, 3, 00, tzinfo=datetime.timezone.utc),
        }
    }
    data_query_to_delete = {
        "forecast_base_time": datetime.datetime(
            2024, 6, 3, 12, tzinfo=datetime.timezone.utc
        )
    }

    main()
    delete_database_data("forecast_data", data_query_to_delete)
    dict_result_after_deletion = get_database_data("forecast_data", data_query)
    main()
    dict_result_after_refill = get_database_data("forecast_data", data_query)
    assert len(dict_result_after_deletion) == 12546
    assert len(dict_result_after_refill) == 18819
