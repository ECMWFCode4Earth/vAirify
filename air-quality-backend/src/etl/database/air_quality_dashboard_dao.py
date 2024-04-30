from pymongo.mongo_client import MongoClient
import os


def insert_data_forecast(data):
    uri = os.environ.get('MONGO_DB_URI')
    client = MongoClient(uri)
    collection = client['air_quality_dashboard_db']['forecast_data']
    try:
        collection.insert_many(data)
    except Exception as exception:
        raise exception
