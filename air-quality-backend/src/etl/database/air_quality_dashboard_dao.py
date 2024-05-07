from datetime import datetime
import os
from pymongo import MongoClient, UpdateOne


def insert_data_forecast(data):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri)
    collection = client[db_name]["forecast_data"]
    update_time = datetime.utcnow()
    update_operations = [
        UpdateOne(
            {"city": doc["city"], "measurement_date": doc["measurement_date"]},
            {"$set": {"last_modified_time": update_time, **doc}},
            upsert=True,
        )
        for doc in data
    ]
    result = collection.bulk_write(update_operations)
    print(
        f"{result.upserted_count} documents upserted, {result.modified_count} modified"
    )
