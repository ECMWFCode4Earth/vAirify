import cdsapi
from datetime import datetime, timedelta
import logging
import os
import xarray as xr
from .forecast_data import ForecastData

CAMS_FORECAST_INTERVAL_HOURS = 3
CAMS_UPDATE_INTERVAL_HOURS = 12


class CamsRequestDetails:

    def __init__(
        self, base_forecast_datetime: datetime, no_of_forecast_times: int = 41
    ):
        self.base_forecast_datetime = base_forecast_datetime
        self.no_of_forecast_times = no_of_forecast_times


def __get_base_request_body(request_details: CamsRequestDetails) -> dict:

    forecast_interval = CAMS_FORECAST_INTERVAL_HOURS
    no_non_base_date_forecasts = request_details.no_of_forecast_times - 1

    max_lead_time = (forecast_interval * no_non_base_date_forecasts) + 1
    leadtime_hour = [str(i) for i in range(0, max_lead_time, forecast_interval)]
    date_str = request_details.base_forecast_datetime.strftime("%Y-%m-%d")
    time_str = request_details.base_forecast_datetime.strftime("%H:%M")

    return {
        "date": f"{date_str}/{date_str}",
        "type": "forecast",
        "format": "grib",
        "time": f"{time_str}",
        "leadtime_hour": leadtime_hour,
    }


def get_single_level_request_body(request_details: CamsRequestDetails) -> dict:
    base_request = __get_base_request_body(request_details)
    base_request["variable"] = [
        "particulate_matter_10um",
        "particulate_matter_2.5um",
        "surface_pressure",
        "10m_u_component_of_wind",
        "10m_v_component_of_wind",
    ]
    return base_request


def get_multi_level_request_body(request_details: CamsRequestDetails) -> dict:
    base_request = __get_base_request_body(request_details)
    base_request["variable"] = [
        "nitrogen_dioxide",
        "ozone",
        "sulphur_dioxide",
        "temperature",
    ]
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


def align_to_cams_publish_time(forecast_base_time: datetime) -> datetime:
    now = datetime.utcnow()
    if forecast_base_time > now:
        raise ValueError("forecast base data cannot be in the future")

    request_for_today = forecast_base_time.date() == now.date()

    current_hour = int(now.strftime("%H"))
    requested_hour = int(forecast_base_time.strftime("%H"))

    if request_for_today:
        if 0 <= current_hour < 10:
            # If asking before 10am, only yesterdays is available
            forecast_base_time -= timedelta(days=1)
            hour = 12
        elif requested_hour >= 12 and current_hour >= 22:
            # If requesting post midday data, it must be past 10pm
            hour = 12
        else:
            # Either the request was for morning data, or that's all that is available
            hour = 0
    else:
        if requested_hour < 12:
            hour = 0
        else:
            hour = 12

    return datetime(
        forecast_base_time.year, forecast_base_time.month, forecast_base_time.day, hour
    )


def fetch_forecast_data(
    base_datetime: datetime = datetime.utcnow(),
    no_of_forecast_times: int = 41,
) -> ForecastData:

    base_datetime = align_to_cams_publish_time(base_datetime)
    request_details = CamsRequestDetails(base_datetime, no_of_forecast_times)
    file_ident = f"{no_of_forecast_times}_from_{base_datetime.strftime('%Y-%m-%d_%H')}"

    task_params = [
        (
            get_single_level_request_body(request_details),
            f"single_level_{file_ident}.grib",
        ),
        (
            get_multi_level_request_body(request_details),
            f"multi_level_{file_ident}.grib",
        ),
    ]
    results = [fetch_cams_data(*params) for params in task_params]
    return ForecastData(*results)
