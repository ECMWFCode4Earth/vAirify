from database_tests.utils.db_helpers import get_database_data
from dotenv import load_dotenv
import os

load_dotenv()

os.environ["MONGO_DB_URI"] = "mongodb+srv://mnyamunda:CVbP4nSZWfDtEAzT@cluster0.ch5gkk4.mongodb.net/"
os.environ["MONGO_DB_NAME"] = "air_quality_dashboard_db_max"
collection_name = "forecast_data"


def test_aqi_levels_are_between_1_and_6():
    query = {}
    dict_result = get_database_data(query, collection_name)
    pollutant_keys = ["no2_aqi_level", "so2_aqi_level", "o3_aqi_level", "pm10_aqi_level", "pm2_5_aqi_level"]

    for document in dict_result:
        overall_aqi_level = document["overall_aqi_level"]
        assert 1 <= overall_aqi_level <= 6, f"overall_aqi_level {overall_aqi_level} is out of range"

    for document in dict_result:
        for key in pollutant_keys:
            assert 1 <= document[key] <= 6, f"{key} {document[key]} is out of range"


def test_overall_aqi_level_is_highest_value_of_pollutant_aqi_levels():
    query = {}
    dict_result = get_database_data(query, collection_name)
    pollutant_keys = ["no2_aqi_level", "so2_aqi_level", "o3_aqi_level", "pm10_aqi_level", "pm2_5_aqi_level"]

    for document in dict_result:
        highest_aqi = max(document[key] for key in pollutant_keys)
        assert document["overall_aqi_level"] == highest_aqi, (
            f"overall_aqi_level {document['overall_aqi_level']} is not equal to the highest AQI level {highest_aqi}"
        )
