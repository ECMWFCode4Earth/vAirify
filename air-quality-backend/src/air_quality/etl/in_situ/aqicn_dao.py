import logging
import os
import requests
from urllib.parse import urlencode


base_url = "https://api.waqi.info/feed"


def fetch_in_situ_measurement(lat: float, long: float):
    query_params = {
        "token": os.environ.get("AQI_CN_API_TOKEN")
    }
    url = f"{base_url}/geo:{lat};{long}?{urlencode(query_params, doseq=True)}"
    logging.info(f"Calling aqicn geo feed: {url}")
    response_json = requests.get(url).json()
    response = response_json["data"]
    associated_city = response["city"]
    pollutant_aqi = response["iaqi"]
    logging.info(f"City details: {associated_city}")
    logging.info(f"Pollutant data: {pollutant_aqi}")


def print_in_situ_measurements(cities):
    for city in cities:
        fetch_in_situ_measurement(city["latitude"], city["longitude"])
