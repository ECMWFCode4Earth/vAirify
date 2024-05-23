from datetime import datetime
import logging
from .mongo_db_operations import get_collection, upsert_data


def insert_data(data):
    upsert_data("in_situ_data", ["measurement_date", "city"], data)


def delete_data_before(measurement_date: datetime):
    result = get_collection("in_situ_data").delete_many(
        {"measurement_date": {"$lt": measurement_date}}
    )
    logging.info(f"Deleted {result.deleted_count} documents from in_situ_data")
