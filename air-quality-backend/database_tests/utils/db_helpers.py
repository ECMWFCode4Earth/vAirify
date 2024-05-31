import os
import pprint

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure


def get_database_data(query: dict, collection_name: str):

    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")

    if not uri or not db_name:
        raise ValueError("Environment variables MONGO_DB_URI and MONGO_DB_NAME must be set")

    try:
        client = MongoClient(uri)
        collection = client[db_name][collection_name]
        cursor = collection.find(query)
        database_dictionary_list = []

        for document in cursor:
            document_as_dict = {
                "name": document["name"],
                "created_time": document["created_time"],
                "last_modified_time": document["last_modified_time"],
                "forecast_base_time": document["forecast_base_time"],
                "forecast_range": document["forecast_range"],
                "forecast_valid_time": document["forecast_valid_time"],
                "overall_aqi_level": document["overall_aqi_level"],
                "o3_value": document["o3"]["value"],
                "so2_value": document["so2"]["value"],
                "no2_value": document["no2"]["value"],
                "pm10_value": document["pm10"]["value"],
                "pm2_5_value": document["pm2_5"]["value"],
                "o3_aqi_level": document["o3"]["aqi_level"],
                "so2_aqi_level": document["so2"]["aqi_level"],
                "no2_aqi_level": document["no2"]["aqi_level"],
                "pm10_aqi_level": document["pm10"]["aqi_level"],
                "pm2_5_aqi_level": document["pm2_5"]["aqi_level"],
            }
            database_dictionary_list.append(document_as_dict)

    except ConnectionFailure:
        raise RuntimeError("Failed to connect to the database")
    except OperationFailure as e:
        raise RuntimeError(f"Database operation failed: {e}")

    finally:
        client.close()

    return database_dictionary_list


def main_fetch():

    query = {}  # must be dict type?
    collection_name = 'forecast_data'  # access collection variable
    result = get_database_data(query, collection_name)

    pprint.pprint(result)


if __name__ == "__main__":
    main_fetch()
