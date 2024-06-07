import datetime


def format_datetime_as_string(date_and_time: datetime, string_format: str) -> str:
    return date_and_time.strftime(string_format)


def create_forecast_api_parameters_payload(
    forecast_base_time: str,
    valid_date_from: str,
    valid_date_to: str,
    location_type: str,
    location_name: str,
) -> dict:
    payload = {
        "forecast_base_time": forecast_base_time,
        "valid_date_from": valid_date_from,
        "valid_date_to": valid_date_to,
        "location_type": location_type,
        "location_name": location_name,
    }

    check_for_and_remove_unused_parameters(
        [
            "forecast_base_time",
            "valid_date_from",
            "valid_date_to",
            "location_type",
            "location_name",
        ],
        payload,
    )

    return payload


def check_for_and_remove_unused_parameters(
    parameters: list[str], api_parameter_payload: dict
) -> dict:
    for parameter in parameters:
        if api_parameter_payload[parameter] == "":
            del api_parameter_payload[parameter]
    return api_parameter_payload
