import json
import os
import requests
from time import sleep


date_from = "2024-03-10T00%3A00%3A00Z"
date_to = "2024-03-17T21%3A53%3A00Z"
sort = "desc"
order_by = "datetime"


def fetch_in_situ_measurements(cities):
    data = []
    for city in cities:
        sleep(1)
        data.append(call_openaq_api(get_coords(city)))
    return data


def call_openaq_api(coordinates):
    api_key = os.environ.get("OPEN_AQ_API_KEY")
    url = (
        "https://api.openaq.org/v2/measurements?"
        + "date_from="
        + date_from
        + "&date_to="
        + date_to
        + "&sort="
        + sort
        + "&coordinates"
        + coordinates
        + "&order_by="
        + order_by
    )
    headers = {"X-API-Key": api_key}
    return json.loads(requests.get(url, headers=headers).text)["results"]


def get_coords(city):
    return str(city["latitude"]) + "&" + str(city["longitude"])
