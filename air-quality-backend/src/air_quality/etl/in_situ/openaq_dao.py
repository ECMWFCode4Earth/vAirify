import json
from datetime import datetime
import logging
import os
import requests
from urllib.parse import urlencode


base_url = "https://api.openaq.org/v2/measurements"


def fetch_in_situ_measurements(cities, date_from: datetime, date_to: datetime):
    in_situ_data_by_city = {}
    cache_location = (
        os.environ["OPEN_AQ_CACHE"] if "OPEN_AQ_CACHE" in os.environ else None
    )

    for city in cities:
        results = retrieve_open_aq_results(city, date_from, date_to, cache_location)
        in_situ_data_by_city[city["name"]] = {"measurements": results, "city": city}
    return in_situ_data_by_city


def retrieve_open_aq_results(
    city, date_from: datetime, date_to: datetime, cache_location: str
):

    results = []
    if cache_location is not None:
        results = read_city_from_cache(city, date_from, date_to, cache_location)

    if len(results) == 0:
        results = call_openaq_api(city, date_from, date_to)

    return results


def read_city_from_cache(
    city, date_from: datetime, date_to: datetime, cache_location: str
) -> list:
    results = []
    date_from_str = date_from.strftime("%Y%m%d%H")
    date_to_str = date_to.strftime("%Y%m%d%H")

    file = f"{cache_location}/{city['name']}_{date_from_str}_{date_to_str}.json"
    if os.path.exists(file):
        with open(file, encoding="utf-8") as f:
            results = json.load(f)

    return results


def call_openaq_api(city, date_from: datetime, date_to: datetime) -> list:
    limit = 3000
    query_params = {
        "limit": limit,
        "page": "1",
        "offset": "0",
        "sort": "desc",
        "order_by": "datetime",
        "radius": "25000",
        "date_to": date_to.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "date_from": date_from.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "coordinates": format_coordinates(city),
        "parameter": ["o3", "no2", "pm10", "so2", "pm25"],
    }
    url = base_url + "?" + urlencode(query_params, doseq=True)
    headers = {"X-API-Key": os.environ.get("OPEN_AQ_API_KEY")}
    logging.debug(f"Calling OpenAQ: {url}")
    response_json = requests.get(url, headers=headers).json()
    results = response_json.get("results")
    if results is not None:
        if len(results) > limit:
            logging.warning(f"More results were present for: {city['name']}")
        return results
    else:
        logging.warning(
            f"Response for {city['name']} contained no results: {response_json}"
        )
        return []


def format_coordinates(city):
    return str(city["latitude"]) + "," + str(city["longitude"])
