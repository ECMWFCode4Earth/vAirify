import cdsapi
from datetime import date
import xarray as xr
from .forecast_data import ForecastData


def __get_base_request_body(model_base_date: str) -> dict:
    return {
        "date": f"{model_base_date}/{model_base_date}",
        "type": "forecast",
        "format": "grib",
        "time": "00:00",
        "leadtime_hour": [
            "24",
            "48",
            "72",
            "96",
            "120",
        ],
    }


def get_single_level_request_body(model_base_date: str) -> dict:
    base_request = __get_base_request_body(model_base_date)
    base_request["variable"] = ["particulate_matter_10um", "particulate_matter_2.5um"]
    return base_request


def get_multi_level_request_body(model_base_date: str) -> dict:
    base_request = __get_base_request_body(model_base_date)
    base_request["variable"] = ["nitrogen_dioxide", "ozone", "sulphur_dioxide"]
    base_request["model_level"] = "137"
    return base_request


def fetch_cams_data(request_body, file_name) -> xr.Dataset:
    c = cdsapi.Client()
    print(f"Loading data from CAMS to file {file_name}, request body: {request_body}")
    c.retrieve("cams-global-atmospheric-composition-forecasts", request_body, file_name)
    return xr.open_dataset(
        file_name, decode_times=False, engine="cfgrib", backend_kwargs={"indexpath": ""}
    )


def fetch_forecast_data() -> ForecastData:
    model_base_date = date.today().strftime("%Y-%m-%d")
    single_level_data = fetch_cams_data(
        get_single_level_request_body(model_base_date), "single_level.grib"
    )
    multi_level_data = fetch_cams_data(
        get_multi_level_request_body(model_base_date), "multi_level.grib"
    )
    return ForecastData(single_level_data, multi_level_data)
