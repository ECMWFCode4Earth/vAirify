import datetime
import requests


def format_datetime_as_string(date_and_time: datetime, string_format: str) -> str:
    return date_and_time.strftime(string_format)


def construct_forecast_api_parameters(
    forecast_base_time: str,
    valid_date_from: str,
    valid_date_to: str,
    location_type: str,
    location_name: str,
) -> dict:
    return {
        "forecast_base_time": forecast_base_time,
        "valid_date_from": valid_date_from,
        "valid_date_to": valid_date_to,
        "location_type": location_type,
        "location_name": location_name,
    }


def get_request_to_forecast_api(
    base_url: str,
    forecast_base_time: str,
    valid_date_from: str,
    valid_date_to: str,
    location_type: str,
    location_name: str,
) -> requests.Response:
    headers = {"accept": "application/json"}
    payload = construct_forecast_api_parameters(
        forecast_base_time, valid_date_from, valid_date_to, location_type, location_name
    )
    return requests.request("GET", base_url, headers=headers, params=payload)
