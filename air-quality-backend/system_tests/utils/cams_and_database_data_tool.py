from src.etl.forecast.forecast_dao import fetch_cams_data
from datetime import date, timedelta, datetime
from scripts.run_forecast_etl import (
    main as run_main_program_capture_forecast_in_database,
)
from system_tests.utils.helper_methods import (
    get_database_data,
    delete_database_data,
    export_cams_data_to_excel_by_level,
    get_raw_cams_data,
    longitude_calculator_for_cams_data,
)
from system_tests.utils.request_builder import RequestBuilder

# Date options
today = date.today().strftime("%Y-%m-%d")  # YYYY-MM-DD
yesterday = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")  # YYYY-MM-DD
model_base_date = today

# range 24 - 120, increments of 3 available
steps = [
    "24",
]

# 359.74852


# provide longitude in: -180 to 180
cams_city_search_details = {
    "name": "London",
    "latitude": 51.50853,
    "longitude": longitude_calculator_for_cams_data(-0.12574, 0.4),
}

database_city_search_details = {
    "measurement_date": datetime(2024, 5, 16, 0, 0),
    "city": "London",
}

# Request bodies
single_level_request = (
    RequestBuilder()
    .with_date(f"{model_base_date}/{model_base_date}")
    .with_type("forecast")
    .with_format("grib")
    .with_time("00:00")
    .with_leadtime_hour(steps)
    .with_variables(["particulate_matter_10um", "particulate_matter_2.5um"])
    .build()
)
multi_level_request = (
    RequestBuilder()
    .with_date(f"{model_base_date}/{model_base_date}")
    .with_type("forecast")
    .with_format("grib")
    .with_time("00:00")
    .with_leadtime_hour(steps)
    .with_variables(["nitrogen_dioxide", "ozone", "sulphur_dioxide"])
    .with_model_level("137")
    .build()
)

single_level_dataset = fetch_cams_data(single_level_request, "../single_level.grib")
multi_level_dataset = fetch_cams_data(multi_level_request, "../multi_level.grib")

delete_database_data("forecast_data")
delete_database_data("in_situ_data")
run_main_program_capture_forecast_in_database()
get_raw_cams_data(
    steps,
    single_level_dataset,
    cams_city_search_details["latitude"],
    cams_city_search_details["longitude"],
    multi_level_dataset,
)
export_cams_data_to_excel_by_level(single_level_dataset, multi_level_dataset)
get_database_data(database_city_search_details)
