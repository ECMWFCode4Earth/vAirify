from pymongo.mongo_client import MongoClient
import os


def insert_data_forecast(data):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri)
    collection = client[db_name]["forecast_data"]
    try:
        collection.insert_many(data)
    except Exception as exception:
        raise exception
