from src.etl.forecast.forecast_dao import fetch_cams_data
from datetime import date, timedelta
from system_tests.utils.helper_methods import (
    get_database_data,
    get_cams_data,
    run_main,
    export_to_excel_by_level,
    delete_database_data,
)
from system_tests.utils.request_builder import RequestBuilder

# Date options
today = date.today().strftime("%Y-%m-%d")  # YYYY-MM-DD
yesterday = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")  # YYYY-MM-DD
model_base_date = today


steps = [
    "24",
]
# cams_city_search_details = {"name": "Dhaka", "latitude": 23.8, "longitude": 90.4}
# database_city_search_details = {"city": "Dhaka"}

cams_city_search_details = {"name": "London", "latitude": 51.6, "longitude": -0.4}
database_city_search_details = {"city": "London"}

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
run_main()
get_cams_data(
    steps,
    single_level_dataset,
    cams_city_search_details["latitude"],
    cams_city_search_details["longitude"],
    multi_level_dataset,
)
export_to_excel_by_level(single_level_dataset, multi_level_dataset)
get_database_data(database_city_search_details)
