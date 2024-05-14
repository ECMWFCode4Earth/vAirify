from datetime import datetime
import logging
import os
from pymongo import MongoClient, UpdateOne


def get_collection(name: str):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri)
    return client[db_name][name]


def _upsert_measurement_data(collection_name, data):
    if len(data) == 0:
        return
    collection = get_collection(collection_name)
    now = datetime.utcnow()
    update_operations = [
        (
            UpdateOne(
                {"city": doc["city"], "measurement_date": doc["measurement_date"]},
                [
                    {
                        "$set": {
                            "last_modified_time": now,
                            "created_time": {
                                "$cond": [
                                    {"$not": ["$created_time"]},
                                    now,
                                    "$created_time",
                                ]
                            },
                            **doc,
                        }
                    }
                ],
                upsert=True,
            )
        )
        for doc in data
    ]
    result = collection.bulk_write(update_operations)
    logging.info(
        f"{result.upserted_count} documents upserted, {result.modified_count} modified"
    )


def insert_data_forecast(data):
    _upsert_measurement_data("forecast_data", data)


def insert_data_openaq(data):
    _upsert_measurement_data("in_situ_data", data)


def get_locations_by_type(location_type: str):
    collection = get_collection("locations")
    cursor = collection.find({"type": location_type})
    results = []
    for document in cursor:
        results.append(document)
    return results
