import os
from datetime import datetime

import xarray
from decimal import Decimal
from pandas import read_csv
from pymongo import MongoClient


def get_dataset_from_coordinates_many_steps(
    dataset: xarray.Dataset, step: str, latitude: float, longitude: float
) -> xarray.Dataset:
    return dataset.sel(
        indexers={
            "step": step,
            "latitude": latitude,
            "longitude": longitude,
        },
        method="nearest",
    )


def get_dataset_from_coordinates_single_step(
    dataset: xarray.Dataset, latitude: float, longitude: float
) -> xarray.Dataset:
    return dataset.sel(
        indexers={
            "latitude": latitude,
            "longitude": longitude,
        },
        method="nearest",
    )


def convert_kg_to_ug(pollutant_value_kg: float) -> float:
    return float(pollutant_value_kg) * float(10**9)


def print_cams_data(
    single_level_dataset_from_coordinates: xarray.Dataset,
    multi_level_dataset_from_coordinates: xarray.Dataset,
):
    pm2p5 = single_level_dataset_from_coordinates["pm2p5"].values
    pm10 = single_level_dataset_from_coordinates["pm10"].values
    go3 = multi_level_dataset_from_coordinates["go3"].values
    so2 = multi_level_dataset_from_coordinates["so2"].values
    no2 = multi_level_dataset_from_coordinates["no2"].values

    pm2p5_ug = convert_kg_to_ug(float(pm2p5))
    pm10_ug = convert_kg_to_ug(float(pm10))
    go3_ug = convert_kg_to_ug(float(go3))
    so2_ug = convert_kg_to_ug(float(so2))
    no2_ug = convert_kg_to_ug(float(no2))
    print(
        "no2: {}\ngo3: {}\npm10: {}\npm2p5: {}\nso2: {}".format(
            no2_ug, go3_ug, pm10_ug, pm2p5_ug, so2_ug
        )
    )


def get_raw_cams_data(
    steps: list[str],
    single_level_dataset: xarray.Dataset,
    lat: float,
    lon: float,
    multi_level_dataset: xarray.Dataset,
):
    print(
        "\nFetching forecast data from CAMS for latitude: {}, longitude: {}...".format(
            lat, lon
        )
    )

    if len(steps) > 1:
        for step in steps:
            print("\nStep: {}".format(step))
            single_level_dataset_from_coordinates = (
                get_dataset_from_coordinates_many_steps(
                    single_level_dataset, step, lat, lon
                )
            )
            multi_level_dataset_from_coordinates = (
                get_dataset_from_coordinates_many_steps(
                    multi_level_dataset, step, lat, lon
                )
            )

            print_cams_data(
                single_level_dataset_from_coordinates,
                multi_level_dataset_from_coordinates,
            )
    else:
        print("\nStep: {}".format(steps))
        single_level_dataset_from_coordinates = (
            get_dataset_from_coordinates_single_step(single_level_dataset, lat, lon)
        )
        multi_level_dataset_from_coordinates = get_dataset_from_coordinates_single_step(
            multi_level_dataset, lat, lon
        )
        print_cams_data(
            single_level_dataset_from_coordinates, multi_level_dataset_from_coordinates
        )


def get_database_data(collection_name: str):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri)
    collection = client[db_name][collection_name]
    cursor = collection.find()
    database_dictionary_list = []

    for document in cursor:
        document_as_dict = {
            "name": document["name"],
            "created_time": document["created_time"],
            "last_modified_time": document["last_modified_time"],
            "forecast_base_time": document["forecast_base_time"],
            "forecast_range": document["forecast_range"],
            "forecast_valid_time": document["forecast_valid_time"],
            "o3_value": document["o3"]["value"],
            "so2_value": document["so2"]["value"],
            "no2_value": document["no2"]["value"],
            "pm10_value": document["pm10"]["value"],
            "pm2_5_value": document["pm2_5"]["value"],
        }
        database_dictionary_list.append(document_as_dict)
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


def export_dataset_to_excel(dataset: xarray.Dataset, filename: str):
    dataset.to_dataframe().to_excel(filename)


def export_data_array_to_excel(data_array: xarray.DataArray, filename: str):
    data_array.to_dataframe().to_excel(filename)


def export_cams_data_to_excel_by_level(
    single_level_dataset: xarray.Dataset, multi_level_dataset: xarray.Dataset
):
    print("\nExporting to Excel: Single level data...")
    export_dataset_to_excel(single_level_dataset, "AllSingleLevelData.xlsx")
    print("\nExporting to Excel: Multi level data...")
    export_dataset_to_excel(multi_level_dataset, "AllMultiLevelData.xlsx")


def export_to_excel_by_pollutant(
    single_level_dataset: xarray.Dataset, multi_level_dataset: xarray.Dataset
):
    print("\nExporting to Excel...")
    export_data_array_to_excel(single_level_dataset["pm10"], "pm10.xlsx")
    export_data_array_to_excel(single_level_dataset["pm2p5"], "pm2p5.xlsx")
    export_data_array_to_excel(multi_level_dataset["no2"], "no2.xlsx")
    export_data_array_to_excel(multi_level_dataset["so2"], "so2.xlsx")
    export_data_array_to_excel(multi_level_dataset["go3"], "go3.xlsx")


def longitude_calculator_for_cams_data(
    longitude_value: float, data_increment_size: float
):
    if -180 < longitude_value <= 0 - (data_increment_size / 2):
        return float(Decimal(str(longitude_value)) + Decimal("360"))
    else:
        return longitude_value


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
