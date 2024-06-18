import os
from datetime import datetime
from pandas import read_csv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure


def get_database_data(query: dict, collection_name: str):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")

    if not uri or not db_name:
        raise ValueError("MONGO_DB_URI and MONGO_DB_NAME must be set!")

    try:
        client = MongoClient(uri)
        collection = client[db_name][collection_name]
        cursor = collection.find(query)
        database_dictionary_list = []

        for document in cursor:
            document_as_dict = {
                "name": document["name"],
                "created_time": document["created_time"],
                "last_modified_time": document["last_modified_time"],
                "forecast_base_time": document["forecast_base_time"],
                "forecast_range": document["forecast_range"],
                "forecast_valid_time": document["forecast_valid_time"],
                "overall_aqi_level": document["overall_aqi_level"],
                "location_type": document["location_type"],
                "o3_value": document["o3"]["value"],
                "so2_value": document["so2"]["value"],
                "no2_value": document["no2"]["value"],
                "pm10_value": document["pm10"]["value"],
                "pm2_5_value": document["pm2_5"]["value"],
                "o3_aqi_level": document["o3"]["aqi_level"],
                "so2_aqi_level": document["so2"]["aqi_level"],
                "no2_aqi_level": document["no2"]["aqi_level"],
                "pm10_aqi_level": document["pm10"]["aqi_level"],
                "pm2_5_aqi_level": document["pm2_5"]["aqi_level"],
            }
            database_dictionary_list.append(document_as_dict)

    except ConnectionFailure:
        raise RuntimeError("Failed to connect to the database")
    except OperationFailure as e:
        raise RuntimeError(f"Database operation failed: {e}")

    finally:
        client.close()

    return database_dictionary_list


def delete_database_data(collection_name: str):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri)
    collection = client[db_name][collection_name]

    print(
        "Deleting existing forecast data from Mongo DB database: "
        "{}, collection: {}".format(db_name, collection_name)
    )

    collection.delete_many({})
    client.close()


def get_location_name_from_locations_dict(countries_list: list[dict], location_id: str):
    for entry in countries_list:
        if entry["id"] == location_id:
            return entry["city"]


def convert_cams_locations_file_to_dict(cams_locations_file_name: str) -> list[dict]:
    dataframe = read_csv(cams_locations_file_name, encoding="utf-8")
    to_include = ["id", "city"]
    streamlined_dataframe = dataframe[to_include]
    return streamlined_dataframe.to_dict("records")


def get_ecmwf_forecast_to_dict_for_countries(
    cams_locations_file_name: str,
    ecmwf_forecast_file_name: str,
):
    ecmwf_countries_dict = convert_cams_locations_file_to_dict(cams_locations_file_name)
    list_of_records = read_csv(ecmwf_forecast_file_name).to_dict("records")

    for record in list_of_records:
        location_id = record["location_id"]
        record["location_name"] = get_location_name_from_locations_dict(
            ecmwf_countries_dict, location_id
        )
    return list_of_records


def calculate_database_divergence_from_ecmwf_forecast_values(
    database_ozone_value: float, ecmwf_forecast_ozone_value: float
) -> float:
    divergence_percentage = (
        (database_ozone_value - ecmwf_forecast_ozone_value) / ecmwf_forecast_ozone_value
    ) * 100
    if divergence_percentage < 0:
        formatted_divergence_percentage = divergence_percentage * -1
    else:
        formatted_divergence_percentage = divergence_percentage
    return formatted_divergence_percentage


def get_ecmwf_record_for_city_and_valid_time(
    test_city: str, test_forecast_valid_time: datetime, ecmwf_all_data: list[dict]
) -> list[dict]:
    return list(
        filter(
            lambda x: x["location_name"] == test_city
            and x["valid_time"] == test_forecast_valid_time.strftime("%Y-%m-%dT%H:%M"),
            ecmwf_all_data,
        )
    )


def get_database_record_for_city_and_valid_time(
    test_forecast_base_time: datetime,
    test_city: str,
    test_forecast_valid_time: datetime,
    database_all_data: list[dict[str]],
) -> list[dict]:
    return list(
        filter(
            lambda x: x["forecast_base_time"] == test_forecast_base_time
            and x["name"] == test_city
            and x["forecast_valid_time"] == test_forecast_valid_time,
            database_all_data,
        )
    )


def get_pollutant_value(
    pollutant: str, source_name: str, list_of_records_from_source: list[dict]
):
    first_record = list_of_records_from_source[0]
    pollutant_name_upper_case = pollutant.upper()

    if source_name.lower() == "ecmwf_forecast":
        return first_record[pollutant_name_upper_case]
    elif source_name.lower() == "database_forecast":
        match pollutant_name_upper_case:
            case "O3":
                return first_record["o3_value"]
            case "NO2":
                return first_record["no2_value"]
            case "PM10":
                return first_record["pm10_value"]
            case "PM2.5":
                return first_record["pm2_5_value"]
    else:
        raise ValueError("Invalid source name for forecast")


def get_forecast_percentage_divergence(
    test_city: str,
    test_forecast_valid_time: datetime,
    ecmwf_all_data: list[dict],
    test_forecast_base_time: datetime,
    database_all_data: list[dict[str]],
    pollutant: str,
) -> float:
    ecmwf_record_for_city_and_valid_time = get_ecmwf_record_for_city_and_valid_time(
        test_city, test_forecast_valid_time, ecmwf_all_data
    )

    database_record_for_city_and_valid_time = (
        get_database_record_for_city_and_valid_time(
            test_forecast_base_time,
            test_city,
            test_forecast_valid_time,
            database_all_data,
        )
    )

    ecmwf_forecast_pollutant_value = get_pollutant_value(
        pollutant,
        "ecmwf_forecast",
        ecmwf_record_for_city_and_valid_time,
    )
    database_pollutant_value = get_pollutant_value(
        pollutant, "database_forecast", database_record_for_city_and_valid_time
    )

    return calculate_database_divergence_from_ecmwf_forecast_values(
        database_pollutant_value, ecmwf_forecast_pollutant_value
    )
