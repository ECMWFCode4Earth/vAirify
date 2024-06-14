import sys
import pandas as pd
from pymongo import MongoClient


def main(db_uri, db_name):
    df = pd.read_csv("CAMS_locations_V1.csv")
    df["type"] = "city"
    df.drop("id", axis=1, inplace=True)
    df.drop("timezone", axis=1, inplace=True)
    df.rename(columns={"city": "name"}, inplace=True)

    data = df.to_dict(orient="records")
    print(f"Adding {data.__len__()} cities to database")

    db_uri = sys.argv[1]
    db_name = sys.argv[2]

    client = MongoClient(db_uri, tz_aware=True)
    collection = client[db_name]["locations"]

    collection.delete_many({"type": "city"})
    collection.insert_many(data)


if __name__ == "__main__":
    db_uri = sys.argv[1]
    db_name = sys.argv[2]

    main(db_uri, db_name)
