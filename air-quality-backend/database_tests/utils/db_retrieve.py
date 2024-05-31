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
    pprint.pprint(dict_result)

    for document in dict_result:
        overall_aqi_level = document["overall_aqi_level"]
        assert 1 <= overall_aqi_level <= 6, f"overall_aqi_level {overall_aqi_level} is out of range"

        no2_aqi_level = document["no2_aqi_level"]
        assert 1 <= no2_aqi_level <= 6, f"individual_aqi_level {no2_aqi_level} is out of range"

        o3_aqi_level = document["o3_aqi_level"]
        assert 1 <= o3_aqi_level <= 6, f"individual_aqi_level {o3_aqi_level} is out of range"

        so2_aqi_level = document["so2_aqi_level"]
        assert 1 <= so2_aqi_level <= 6, f"individual_aqi_level {so2_aqi_level} is out of range"

        pm10_aqi_level = document["pm10_aqi_level"]
        assert 1 <= pm10_aqi_level <= 6, f"individual_aqi_level {pm10_aqi_level} is out of range"

        pm2_5_aqi_level = document["pm2_5_aqi_level"]
        assert 1 <= pm2_5_aqi_level <= 6, f"individual_aqi_level {pm2_5_aqi_level} is out of range"


def dict_print():
    dict_stuff = main_fetch()

    print(dict_stuff)


if __name__ == "__main__":
    dict_print()
