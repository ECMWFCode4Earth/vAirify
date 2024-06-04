from datetime import datetime
import logging
import os
from pymongo import MongoClient, UpdateOne


def get_collection(name: str):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri, tz_aware=True)
    return client[db_name][name]


def upsert_data(collection_name: str, keys: list[str], data):
    if len(data) == 0:
        return
    logging.info(f"Persisting {len(data)} documents")
    collection = get_collection(collection_name)
    now = datetime.utcnow()

    update_operations = [
        UpdateOne(
            {key: doc[key] for key in keys},
            {
                "$set": {
                    "last_modified_time": now,
                    **doc,
                }
            },
            upsert=True,
        )
        for doc in data
    ]
    result = collection.bulk_write(update_operations)
    inserted = result.upserted_ids.values()
    if len(inserted) > 0:
        id_operations = [
            UpdateOne(
                {"_id": doc_id},
                {"$set": {"created_time": now}},
            )
            for doc_id in inserted
        ]
        collection.bulk_write(id_operations)
    logging.info(
        f"{result.upserted_count} documents upserted, {result.modified_count} modified"
    )
