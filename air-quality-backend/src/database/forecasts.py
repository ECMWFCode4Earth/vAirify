from datetime import datetime
import logging
from .mongo_db_operations import get_collection, upsert_data


def insert_data(data):
    upsert_data(
        "forecast_data",
        [
            "forecast_base_time",
            "forecast_valid_time",
            "location_type",
            "name",
            "source",
        ],
        data,
    )


def delete_data_before(forecast_valid_time: datetime):
    result = get_collection("forecast_data").delete_many(
        {"forecast_valid_time": {"$lt": forecast_valid_time}}
    )
    logging.info(f"Deleted {result.deleted_count} documents from forecast_data")
