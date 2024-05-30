from datetime import datetime
import logging
from .mongo_db_operations import get_collection, upsert_data


collection_name = "forecast_data"


def insert_data(data):
    upsert_data(
        collection_name,
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
    result = get_collection(collection_name).delete_many(
        {"forecast_valid_time": {"$lt": forecast_valid_time}}
    )
    logging.info(f"Deleted {result.deleted_count} documents from {collection_name}")
