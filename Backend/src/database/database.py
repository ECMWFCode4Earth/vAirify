from pymongo.mongo_client import MongoClient

uri = "mongodb+srv://bell-jones:wus04jxgpqMwGBi3@cluster0.ch5gkk4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


def insert_data_forecast(data):
    client = MongoClient(uri)
    collection = client['air_quality_dashboard_db']['forecast_data']
    try:
        collection.insert_many(data)
    except Exception as exception:
        raise exception
