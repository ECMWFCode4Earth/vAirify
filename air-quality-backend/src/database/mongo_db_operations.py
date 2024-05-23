from datetime import datetime
import logging
import os
from pymongo import MongoClient, UpdateOne


def get_collection(name: str):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri)
    return client[db_name][name]


def upsert_data(collection_name: str, keys: list[str], data):
    if len(data) == 0:
        return
    collection = get_collection(collection_name)
    now = datetime.utcnow()

    update_operations = [
        UpdateOne(
            {key: doc[key] for key in keys},
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
        for doc in data
    ]
    result = collection.bulk_write(update_operations)
    logging.info(
        f"{result.upserted_count} documents upserted, {result.modified_count} modified"
    )
