from pymongo import MongoClient

# uri connection string here
client = MongoClient("mongodb+srv://mnyamunda:CVbP4nSZWfDtEAzT@cluster0.ch5gkk4.mongodb.net/")
# what database we are using
db = client['air_quality_dashboard_db_max']
collection = db['forecast_data']
documents = collection.find()
# our query
query = {}
document_query = collection.find(query)
doc_count = collection.count_documents({})

# Keys and allowed values
allowed_aqi_indexes = {1, 2, 3, 4, 5, 6}
overall_aqi_value_key = "overall_aqi_level"
location_type_key = "location_type"
allowed_location_type = "city"

for documents in document_query:

    # only allowing certain values inside overall_aqi_level
    if overall_aqi_value_key in documents:
        value = documents[overall_aqi_value_key]
        assert value in allowed_aqi_indexes, "1 - 6 is allowed as a value here"
    else:
        raise KeyError(f"A document is missing the overall_aqi_level key!")

    # location_type only allowing city as a value

    if location_type_key in documents:
        value = documents[location_type_key]
        assert value in allowed_location_type, "Only City is allowed as a location type"
    else:
        raise KeyError(f" A document is missing location_type key!")

    # print(f'Assertion completed on {doc_count} documents.')


def collection_document_count():
    print(doc_count)

if __name__ == "__main__":
    collection_document_count()
