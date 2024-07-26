import json
import logging
import os
import time
from datetime import datetime
from urllib.parse import urlencode

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

measurements_path = "v2/measurements"


def _create_session() -> requests.Session:
    retry_strategy = Retry(total=2, status_forcelist=[408], raise_on_status=False)
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session = requests.Session()
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def _retrieve_open_aq_results(
    city, date_from: datetime, date_to: datetime, cache_location: str, session
):

    results = []
    if cache_location is not None:
        results = _read_city_from_cache(city, date_from, date_to, cache_location)

    if len(results) == 0:
        results = _call_openaq_api(city, date_from, date_to, session)

    return results


def _read_city_from_cache(
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


def _call_openaq_api(city, date_from: datetime, date_to: datetime, session) -> list:
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
        "coordinates": str(city["latitude"]) + "," + str(city["longitude"]),
        "parameter": ["o3", "no2", "pm10", "so2", "pm25"],
    }
    url = "{}/{}?{}".format(
        os.environ.get("OPEN_AQ_API_URL"),
        measurements_path,
        urlencode(query_params, doseq=True),
    )
    headers = {"X-API-Key": os.environ.get("OPEN_AQ_API_KEY")}
    logging.debug(f"Calling OpenAQ: {url}")
    try:
        response = session.get(url, headers=headers)
        response.raise_for_status()
        response_json = response.json()
        results = response_json.get("results")
        if len(results) > limit:
            logging.warning(f"More results were present for: {city['name']}")
        return results
    except requests.exceptions.RequestException as e:
        logging.error(f"Response for {city['name']} contained no results: {e.response}")
        logging.error(f"URL was: {url}")
        return []


def fetch_in_situ_measurements(cities, date_from: datetime, date_to: datetime):
    in_situ_data_by_city = {}
    session = _create_session()
    cache_location = (
        os.environ["OPEN_AQ_CACHE"] if "OPEN_AQ_CACHE" in os.environ else None
    )

    for city in cities:
        results = _retrieve_open_aq_results(
            city, date_from, date_to, cache_location, session
        )
        in_situ_data_by_city[city["name"]] = {"measurements": results, "city": city}
        time.sleep(1)  # To stop us getting rate limited by Open AQ
    return in_situ_data_by_city
