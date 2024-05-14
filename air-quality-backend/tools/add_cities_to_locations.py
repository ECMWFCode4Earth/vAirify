import pandas as pd
from src.etl.database.air_quality_dashboard_dao import get_collection

df = pd.read_csv("CAMS_locations_V1.csv")
df["type"] = "city"
df.drop("id", axis=1, inplace=True)
df.drop("timezone", axis=1, inplace=True)
df.rename(columns={"city": "name"}, inplace=True)

data = df.to_dict(orient="records")
print(f"Adding {data.__len__()} cities to database")
collection = get_collection("locations")
collection.delete_many({"type": "city"})
collection.insert_many(data)
