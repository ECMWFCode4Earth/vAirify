from pymongo import MongoClient

# uri connection string here
client = MongoClient("mongodb+srv://mnyamunda:CVbP4nSZWfDtEAzT@cluster0.ch5gkk4.mongodb.net/")
# what database we are using
db = client['air_quality_dashboard_db_max']
collection = db['forecast_data']
documents = collection.find()
# our query
query = {"name": "Vancouver"}
document_query = collection.find(query)

# what we allow
allowed_aqi_indexes = {1, 2, 3, 4, 5, 6}
overall_aqi_value_key = "overall_aqi_value"

for documents in document_query:
    print(documents)

    if overall_aqi_value_key in documents:
        value = documents[overall_aqi_value_key]
        assert value in allowed_aqi_indexes, "Only 1 , 2 , 3, 4, 5, 6 allowed !"
    else:
        raise KeyError(f"Document is missing key!")
    # assert "name" in documents, "Key is missing! What the heck! Fix it!"
    # assert "overall_aqi_level", "bruh"
    #
