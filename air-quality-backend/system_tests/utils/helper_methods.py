import os
from decimal import Decimal

import xarray
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


def get_database_data(query: dict, collection_name: str, exclude: dict):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri)
    collection = client[db_name][collection_name]
    cursor = collection.find(query, exclude)
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
    dataframe = read_csv(cams_locations_file_name)
    to_include = ["id", "city"]
    streamlined_dataframe = dataframe[to_include]
    return streamlined_dataframe.to_dict("records")


def get_ecmwf_forecast_to_dict_for_countries(
    ecmwf_forecast_file_name: str,
):
    ecmwf_countries_dict = convert_cams_locations_file_to_dict("CAMS_locations_V1.csv")
    list_of_records = read_csv(ecmwf_forecast_file_name).to_dict("records")

    for record in list_of_records:
        location_id = record["location_id"]
        record["location_name"] = get_location_name_from_locations_dict(
            ecmwf_countries_dict, location_id
        )
    return list_of_records
