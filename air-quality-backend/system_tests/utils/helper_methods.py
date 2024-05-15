import os

import xarray
from pymongo import MongoClient

from scripts.run_forecast_etl import main


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


def get_cams_data(
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


def get_database_data(query: dict):
    uri = os.environ.get("MONGO_DB_URI")
    db_name = os.environ.get("MONGO_DB_NAME")
    client = MongoClient(uri)
    collection = client[db_name]["forecast_data"]
    exclude = {"_id": 0, "city_location": 0, "last_modified_time": 0}
    cursor = collection.find(query, exclude)

    print("\nFetching forecast data from Mongo DB database: {}\n".format(db_name))
    for doc in cursor:
        formatted_doc = (
            f"Measurement date: {doc['measurement_date']}\n"
            f"no2: {doc['no2']}\n"
            f"go3: {doc['o3']}\n"
            f"pm10: {doc['pm10']}\n"
            f"pm2p5: {doc['pm2_5']}\n"
            f"so2: {doc['so2']}"
        )
        print("{}\n".format(formatted_doc))
    client.close()


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
