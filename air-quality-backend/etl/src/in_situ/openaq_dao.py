import json
import logging
import os
import time
from datetime import datetime
from urllib.parse import urlencode
from threading import Lock

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

LOCATIONS_PATH = "v3/locations"
MEASUREMENTS_PATH = "v3/sensors/{sensor_id}/measurements/hourly"
SUPPORTED_PARAMETERS = ["o3", "no2", "pm10", "so2", "pm25"]


class RateLimiter:
    def __init__(self):
        self.lock = Lock()
        self.api_calls = 0  # Add counter for API calls

    def wait_if_needed(self, response: requests.Response):
        """Check rate limits from response headers and wait if needed"""
        with self.lock:
            self.api_calls += 1  # Increment counter
            remaining = int(response.headers.get("x-ratelimit-remaining", 1))
            if remaining == 0:
                reset_time = int(response.headers.get("x-ratelimit-reset", 0))
                if reset_time > 0:
                    logging.info(
                        f"OpenAQ API rate limit reached. Waiting {reset_time} seconds."
                    )
                    time.sleep(reset_time)

    def get_api_calls(self):
        """Get total number of API calls made"""
        return self.api_calls


# Create a global rate limiter instance
rate_limiter = RateLimiter()


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
        results = _call_openaq_api_v3(city, date_from, date_to, session)

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


def _make_request(
    session: requests.Session, url: str, headers: dict
) -> requests.Response:
    """Make a request and handle rate limiting"""
    max_retries = 3  # Maximum number of retries for rate limit
    retry_count = 0

    while retry_count < max_retries:
        try:
            response = session.get(url, headers=headers)

            # Handle 429 Too Many Requests
            if response.status_code == 429:
                retry_count += 1
                wait_time = 300  # Default wait time if header not present

                # Try to get wait time from response headers
                if "retry-after" in response.headers:
                    wait_time = int(response.headers["retry-after"])

                logging.warning(
                    f"Rate limit exceeded (429). Waiting {wait_time} seconds. "
                    f"Retry {retry_count}/{max_retries}"
                )
                time.sleep(wait_time)
                continue

            rate_limiter.wait_if_needed(response)
            response.raise_for_status()
            return response

        except requests.exceptions.RequestException as e:
            if hasattr(e.response, "headers"):
                rate_limiter.wait_if_needed(e.response)

            # If it's a rate limit error, continue the retry loop
            if hasattr(e.response, "status_code") and e.response.status_code == 429:
                if retry_count < max_retries - 1:  # Don't sleep on last retry
                    retry_count += 1
                    wait_time = 300
                    if "retry-after" in e.response.headers:
                        wait_time = int(e.response.headers["retry-after"])
                    logging.warning(
                        f"Rate limit exceeded (429) in error. Waiting {wait_time} seconds. "
                        f"Retry {retry_count}/{max_retries}"
                    )
                    time.sleep(wait_time)
                    continue
            raise

    # If we've exhausted all retries
    raise requests.exceptions.RequestException(
        f"Failed to make request after {max_retries} retries due to rate limiting"
    )


def _get_locations_with_sensors(city, session, date_from: datetime) -> list:
    """Get all sensor IDs for a given city location"""
    query_params = {
        "limit": 1000,
        "page": 1,
        "radius": 25000,
        "coordinates": f"{city['latitude']},{city['longitude']}",
    }

    url = "{}/{}?{}".format(
        os.environ.get("OPEN_AQ_API_URL"), LOCATIONS_PATH, urlencode(query_params)
    )

    headers = {"X-API-Key": os.environ.get("OPEN_AQ_API_KEY")}
    sensor_ids = []
    active_locations = set()  # Track unique active locations

    try:
        response = _make_request(session, url, headers)
        locations = response.json().get("results", [])

        for location in locations:
            # Check if location has recent data
            datetime_last = location.get("datetimeLast", {})
            if not datetime_last or not isinstance(datetime_last, dict):
                logging.debug(
                    f"Skipping location {location.get('name')} in {city['name']} - "
                    f"No last data time available"
                )
                continue

            utc_time = datetime_last.get("utc")
            if not utc_time:
                logging.debug(
                    f"Skipping location {location.get('name')} in {city['name']} - "
                    f"No UTC timestamp available"
                )
                continue

            try:
                last_data_time = datetime.strptime(utc_time, "%Y-%m-%dT%H:%M:%SZ")
                if last_data_time < date_from:
                    logging.debug(
                        f"Skipping location {location.get('name')} in {city['name']} - "
                        f"Last data point ({last_data_time.isoformat()}) "
                        f"is before requested date ({date_from.isoformat()})"
                    )
                    continue
            except (ValueError, TypeError):
                logging.warning(
                    f"Invalid datetimeLast format for location {location.get('name')} "
                    f"in {city['name']}: {utc_time}"
                )
                continue

            coordinates = location.get("coordinates", {})
            is_monitor = location.get("isMonitor", False)
            location_name = location.get("name")
            active_locations.add(location_name)  # Add to active locations set

            for sensor in location.get("sensors", []):
                parameter = sensor.get("parameter", {}).get("name")
                if parameter in SUPPORTED_PARAMETERS:
                    sensor_ids.append(
                        {
                            "id": sensor.get("id"),
                            "parameter": parameter,
                            "location_name": location_name,
                            "coordinates": {
                                "latitude": coordinates.get("latitude"),
                                "longitude": coordinates.get("longitude"),
                            },
                            "is_monitor": is_monitor,
                        }
                    )

        if active_locations:
            logging.info(
                f"Found {len(active_locations)} active locations in {city['name']}: "
                f"{', '.join(sorted(active_locations))}"
            )
        else:
            logging.info(f"No active locations found in {city['name']}")

        return sensor_ids
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to get locations for {city['name']}: {str(e)}")
        return []


def _get_measurements_for_sensor(
    sensor_info, date_from, date_to, session, city
) -> list:
    """Get measurements for a specific sensor ID"""
    # Ensure dates are in UTC and format them correctly
    query_params = {
        "datetime_from": date_from.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "datetime_to": date_to.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "limit": 1000,
        "page": 1,
    }

    url = "{}/{}?{}".format(
        os.environ.get("OPEN_AQ_API_URL"),
        MEASUREMENTS_PATH.format(sensor_id=sensor_info["id"]),
        urlencode(query_params),
    )

    headers = {"X-API-Key": os.environ.get("OPEN_AQ_API_KEY")}

    try:
        response = _make_request(session, url, headers)
        measurements_found = response.json().get("meta", {}).get("found", 0)
        logging.info(
            f"Found {measurements_found} {sensor_info['parameter']} measurements for sensor {sensor_info['id']} in city {city['name']} at location {sensor_info['location_name']}"
        )
        response.raise_for_status()
        measurements = response.json().get("results", [])

        # Transform to v2 API format
        transformed_measurements = []
        for m in measurements:
            period = m.get("period", {})
            datetime_from = period.get("datetimeFrom", {})
            datetime_to = period.get("datetimeTo", {})
            parameter = m.get("parameter", {})
            summary = m.get("summary", {})

            # Skip measurements without average value
            if "avg" not in summary:
                continue

            logging.debug(
                f"Processing measurement from {datetime_from.get('utc')} to {datetime_to.get('utc')}"
            )

            transformed_measurements.append(
                {
                    "parameter": sensor_info["parameter"],
                    "value": summary.get("avg"),
                    "unit": parameter.get("units"),
                    "location": sensor_info["location_name"],
                    "date": {
                        "utc": datetime_to.get("utc"),  # Use end time of the period
                        "local": datetime_to.get("local"),  # Use end time of the period
                    },
                    "coordinates": sensor_info["coordinates"],
                    "entity": "OpenAQ",
                    "sensorType": (
                        "reference grade"
                        if sensor_info["is_monitor"]
                        else "not reference grade"
                    ),
                }
            )

        return transformed_measurements
    except requests.exceptions.RequestException as e:
        logging.error(
            f"Failed to get measurements for sensor {sensor_info['id']}: {str(e)}"
        )
        return []


def _call_openaq_api_v3(city, date_from: datetime, date_to: datetime, session) -> list:
    """Get measurements using v3 API endpoints"""
    all_results = []

    # Step 1: Get all relevant sensor IDs for the city
    sensor_ids = _get_locations_with_sensors(city, session, date_from)

    if not sensor_ids:
        return []

    # Step 2: Get measurements for each sensor
    for sensor_info in sensor_ids:
        measurements = _get_measurements_for_sensor(
            sensor_info, date_from, date_to, session, city
        )
        all_results.extend(measurements)

    return all_results


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
        in_situ_data_by_city[city["name"]] = {
            "measurements": results,
            "city": {
                "name": city["name"],
                "type": city["type"],  # Ensure type is passed through
            },
        }
    return in_situ_data_by_city
