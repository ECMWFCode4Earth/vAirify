import cdsapi
from datetime import datetime
import logging
import os
import xarray as xr
from .forecast_data import ForecastData


def __get_base_request_body(model_base_date: str, model_base_time: str) -> dict:
    leadtime_hour = [str(i) for i in range(0, 121, 3)]
    return {
        "date": f"{model_base_date}/{model_base_date}",
        "type": "forecast",
        "format": "grib",
        "time": f"{model_base_time}:00",
        "leadtime_hour": leadtime_hour,
    }


def get_single_level_request_body(model_base_date: str, model_base_time: str) -> dict:
    base_request = __get_base_request_body(model_base_date, model_base_time)
    base_request["variable"] = ["particulate_matter_10um", "particulate_matter_2.5um"]
    return base_request


def get_multi_level_request_body(model_base_date: str, model_base_time: str) -> dict:
    base_request = __get_base_request_body(model_base_date, model_base_time)
    base_request["variable"] = ["nitrogen_dioxide", "ozone", "sulphur_dioxide"]
    base_request["model_level"] = "137"
    return base_request


def fetch_cams_data(request_body, file_name) -> xr.Dataset:
    c = cdsapi.Client()
    logging.info(f"Loading data from CAMS to file {file_name}")
    if not os.path.exists(file_name):
        c.retrieve(
            "cams-global-atmospheric-composition-forecasts", request_body, file_name
        )
    return xr.open_dataset(
        file_name, decode_times=False, engine="cfgrib", backend_kwargs={"indexpath": ""}
    )


def fetch_forecast_data(
    model_base_date: datetime,
) -> ForecastData:
    model_base_date_str = model_base_date.strftime("%Y-%m-%d")
    model_base_time = "00"
    task_params = [
        (
            get_single_level_request_body(model_base_date_str, model_base_time),
            f"single_level_{model_base_date_str}_{model_base_time}.grib",
        ),
        (
            get_multi_level_request_body(model_base_date_str, model_base_time),
            f"multi_level_{model_base_date_str}_{model_base_time}.grib",
        ),
    ]
    results = [fetch_cams_data(*params) for params in task_params]
    return ForecastData(*results)
