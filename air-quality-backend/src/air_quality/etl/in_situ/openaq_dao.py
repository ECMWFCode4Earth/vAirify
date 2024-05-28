from datetime import datetime
import logging
import os
import requests
from urllib.parse import urlencode


base_url = "https://api.openaq.org/v2/measurements"


def fetch_in_situ_measurements(cities, date_from: datetime, date_to: datetime):
    in_situ_data_by_city = {}
    for city in cities:
        results = call_openaq_api(city, date_from, date_to)
        in_situ_data_by_city[city["name"]] = {"measurements": results, "city": city}
    return in_situ_data_by_city


def call_openaq_api(city, date_from: datetime, date_to: datetime) -> list:
    query_params = {
        "limit": "3000",
        "page": "1",
        "offset": "0",
        "sort": "desc",
        "order_by": "datetime",
        "radius": "25000",
        "date_to": date_to.strftime("%Y-%m-%dT%H:%M:%S"),
        "date_from": date_from.strftime("%Y-%m-%dT%H:%M:%S"),
        "coordinates": format_coordinates(city),
        "parameter": ["o3", "no2", "pm10", "so2", "pm25"],
    }
    url = base_url + "?" + urlencode(query_params, doseq=True)
    headers = {"X-API-Key": os.environ.get("OPEN_AQ_API_KEY")}
    logging.debug(f"Calling OpenAQ: {url}")
    response_json = requests.get(url, headers=headers).json()
    if response_json.get("results") is not None:
        return response_json["results"]
    else:
        logging.warning(f"Response contained no results: {response_json}")
        return []


def format_coordinates(city):
    return str(city["latitude"]) + "," + str(city["longitude"])
