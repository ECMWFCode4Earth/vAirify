import logging
import os
from datetime import datetime
from urllib.parse import urlencode

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

base_url = "https://api.openaq.org/v2/measurements"


def _create_session() -> requests.Session:
    retry_strategy = Retry(total=3, status_forcelist=[408], raise_on_status=False)
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session = requests.Session()
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def _call_openaq_api(
    city, date_from: datetime, date_to: datetime, session: requests.Session
) -> list:
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
    url = base_url + "?" + urlencode(query_params, doseq=True)
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
    for city in cities:
        results = _call_openaq_api(city, date_from, date_to, session)
        in_situ_data_by_city[city["name"]] = {"measurements": results, "city": city}
    return in_situ_data_by_city
