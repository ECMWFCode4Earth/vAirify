import os

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

from shared.src.database.forecasts import Forecast
from shared.src.database.in_situ import InSituMeasurement


def get_database_data(collection_name: str, query_filter=None):
    if query_filter is None:
        query_filter = {}
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")

    if not uri or not db_name:
        raise ValueError("MONGO_DB_URI and MONGO_DB_NAME must be set!")

    try:
        client = MongoClient(uri, tz_aware=True)
        collection = client[db_name][collection_name]
        cursor = collection.find(query_filter)
        database_dictionary_list = []

        for document in cursor:
            database_dictionary_list.append(document)

    except ConnectionFailure:
        raise RuntimeError("Failed to connect to the database")
    except OperationFailure as e:
        raise RuntimeError(f"Database operation failed: {e}")

    finally:
        client.close()

    return database_dictionary_list


def delete_database_data(collection_name: str, delete_filter=None):
    if delete_filter is None:
        delete_filter = {}
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri)
    collection = client[db_name][collection_name]

    print(
        "Deleting existing forecast data from Mongo DB database: "
        "{}, collection: {}".format(db_name, collection_name)
    )

    collection.delete_many(delete_filter)
    client.close()


def seed_api_test_data(
    collection_name: str, test_data_list: list[Forecast | InSituMeasurement]
):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri)
    collection = client[db_name][collection_name]
    collection.insert_many(test_data_list)
