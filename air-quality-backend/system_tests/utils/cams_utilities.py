from datetime import datetime
from pandas import read_csv


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
    database_all_data: list[dict],
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
                return first_record["o3"]["value"]
            case "NO2":
                return first_record["no2"]["value"]
            case "PM10":
                return first_record["pm10"]["value"]
            case "PM2.5":
                return first_record["pm2_5"]["value"]
    else:
        raise ValueError("Invalid source name for forecast")


def get_forecast_percentage_divergence(
    test_city: str,
    test_forecast_valid_time: datetime,
    ecmwf_all_data: list[dict],
    test_forecast_base_time: datetime,
    database_all_data: list[dict],
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
