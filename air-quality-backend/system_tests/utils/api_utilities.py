import datetime
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from air_quality.database.forecasts import Forecast
from system_tests.utils.cams_utilities import delete_database_data


def format_datetime_as_string(date_and_time: datetime, string_format: str) -> str:
    return date_and_time.strftime(string_format)


def get_expected_valid_times_list(
    forecast_base_time: datetime.datetime, step_hours: int
) -> list[str]:
    expected_valid_time_list = [forecast_base_time]
    step = datetime.timedelta(hours=step_hours)
    number_of_forecast_times = ((24 / step_hours) * 5) + 1

    i = 1
    while i <= (number_of_forecast_times - 1):
        next_valid_time = (
            expected_valid_time_list[len(expected_valid_time_list) - 1] + step
        )
        expected_valid_time_list.append(next_valid_time)
        i += 1

    formatted_expected_valid_time_list = []

    for valid_time in expected_valid_time_list:
        formatted_valid_time = format_datetime_as_string(
            valid_time, "%Y-%m-%dT%H:%M:%S+00:00"
        )
        formatted_expected_valid_time_list.append(formatted_valid_time)

    return formatted_expected_valid_time_list


def get_list_of_keys(response_json, key_to_add_to_list: str) -> list:
    list_of_keys = []
    for forecast in response_json:
        list_of_keys.append(forecast[key_to_add_to_list])
    return list_of_keys


def seed_api_test_data(collection_name: str, test_data_list: list[Forecast]):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri)
    collection = client[db_name][collection_name]
    collection.insert_many(test_data_list)


def setup_purge_database_and_seed_with_test_data(
    env_file_path: str, database_name: str, test_data: list
):
    load_dotenv(env_file_path)
    delete_database_data(database_name)
    seed_api_test_data(database_name, test_data)
