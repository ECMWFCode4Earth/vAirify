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


def get_forecast_data_from_database(
    valid_date_from: datetime,
    valid_date_to: datetime,
    location_type: str,
    forecast_base_time: datetime,
    location_name: str,
):
    collection = get_collection("forecast_data")
    query = {
        "location_type": location_type,
        "forecast_base_time": forecast_base_time,
        "forecast_valid_time": {
            "$gte": valid_date_from,
            "$lt": valid_date_to,
        },
    }
    if location_name is not None:
        query["name"] = location_name
    return list(collection.find(query))
