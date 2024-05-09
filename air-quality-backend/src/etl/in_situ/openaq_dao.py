import os
from datetime import datetime, timedelta
from time import sleep

import requests

url_base_string = (
    "{}?date_from={}&date_to={}&limit={}&page={}"
    "&offset={}&sort={}&coordinates={}&order_by={}&radius={}"
)
endpoint = "https://api.openaq.org/v2/measurements"
date_from = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
date_to = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
limit = "3000"
page = "1"
offset = "0"
sort = "desc"
order_by = "datetime"
radius = "5000"


def fetch_in_situ_measurements(cities):
    data = []
    for city in cities:
        sleep(1)
        data.append(call_openaq_api(format_coordinates(city)))
    return data


def call_openaq_api(coordinates):
    url = url_base_string.format(
        endpoint,
        date_from,
        date_to,
        limit,
        page,
        offset,
        sort,
        coordinates,
        order_by,
        radius,
    )
    headers = {"X-API-Key": os.environ.get("OPEN_AQ_API_KEY")}
    return requests.get(url, headers=headers).json()


def format_coordinates(city):
    return str(city["latitude"]) + "," + str(city["longitude"])
