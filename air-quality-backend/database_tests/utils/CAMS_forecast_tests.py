import json
import pprint
from database_tests.utils.db_helpers import get_database_data
from database_tests.utils.db_helpers import main_fetch

allowed_aqi_indexes = {1, 2, 3, 4, 5, 6}
overall_aqi_value_key = "overall_aqi_level"
location_type_key = "location_type"
allowed_location_type = "city"


def test_aqi_levels_are_between_1_and_6():
    import os
    os.environ["MONGO_DB_URI"] = "mongodb+srv://mnyamunda:CVbP4nSZWfDtEAzT@cluster0.ch5gkk4.mongodb.net/"
    os.environ["MONGO_DB_NAME"] = "air_quality_dashboard_db_max"

    query = {}
    collection_name = "forecast_data"

    dict_result = get_database_data(query, collection_name)

    pollutant_keys = ["no2_aqi_level", "so2_aqi_level", "o3_aqi_level", "pm10_aqi_level", "pm2_5_aqi_level"]

    for document in dict_result:
        overall_aqi_level = document["overall_aqi_level"]
        assert 1 <= overall_aqi_level <= 6, f"overall_aqi_level {overall_aqi_level} is out of range"

    for document in dict_result:
        for key in pollutant_keys:
            assert 1 <= document[key] <= 6, f"{key} {document[key]} is out of range"


def dict_print():
    dict_stuff = main_fetch()

    print(dict_stuff)


if __name__ == "__main__":
    dict_print()
