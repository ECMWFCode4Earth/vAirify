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
MEASUREMENTS_PAGE_LIMIT = 1000
OPEN_AQ_DATE_FORMAT = "%Y-%m-%dT%H:%M:%SZ"


class RateLimiter:
    def __init__(self):
        self.lock = Lock()
        self.api_calls = 0  # Add counter for API calls
        # Defaults keep the cron behaviour; the backfill raises both to stay
        # under OpenAQ's hourly limit and to ride out occasional 429s.
        self.min_interval_seconds = 0.0
        self.max_rate_limit_retries = 3
        self._last_request_time = 0.0

    def pace(self):
        """Space requests at least min_interval_seconds apart"""
        if self.min_interval_seconds <= 0:
            return
        with self.lock:
            wait = (
                self._last_request_time + self.min_interval_seconds - time.monotonic()
            )
            if wait > 0:
                time.sleep(wait)
            self._last_request_time = time.monotonic()

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


SERVER_ERROR_STATUSES = [500, 502, 503, 504]


def _create_session(retry_server_errors: bool = False) -> requests.Session:
    if retry_server_errors:
        # Sleeps of 0, 10, 20, 40, 80 seconds between attempts
        retry_strategy = Retry(
            total=5,
            backoff_factor=5,
            status_forcelist=[408, *SERVER_ERROR_STATUSES],
            raise_on_status=False,
        )
    else:
        retry_strategy = Retry(total=2, status_forcelist=[408], raise_on_status=False)
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session = requests.Session()
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def _retrieve_open_aq_results(
    city, date_from: datetime, date_to: datetime, cache_location: str, session
):
    results = None
    if cache_location is not None:
        results = _read_city_from_cache(city, date_from, date_to, cache_location)

    # A cache file holding an empty list means "no data", so only a missing
    # file falls back to the API.
    if results is None:
        results = _call_openaq_api_v3(city, date_from, date_to, session)

    return results


def cache_file_path(
    cache_location: str, city_name: str, date_from: datetime, date_to: datetime
) -> str:
    date_from_str = date_from.strftime("%Y%m%d%H")
    date_to_str = date_to.strftime("%Y%m%d%H")
    return f"{cache_location}/{city_name}_{date_from_str}_{date_to_str}.json"


def _read_city_from_cache(
    city, date_from: datetime, date_to: datetime, cache_location: str
) -> list | None:
    file = cache_file_path(cache_location, city["name"], date_from, date_to)
    if not os.path.exists(file):
        return None

    with open(file, encoding="utf-8") as f:
        return json.load(f)


def _make_request(
    session: requests.Session, url: str, headers: dict
) -> requests.Response:
    """Make a request and handle rate limiting"""
    max_retries = rate_limiter.max_rate_limit_retries
    retry_count = 0

    while retry_count < max_retries:
        try:
            rate_limiter.pace()
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


def _fetch_locations(city, session) -> list:
    """Get all OpenAQ locations within the search radius of a city"""
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
    response = _make_request(session, url, headers)
    return response.json().get("results", [])


def _sensors_from_locations(
    locations: list, city, date_from: datetime, log_summary: bool = True
) -> list:
    """Get the supported sensors of locations with data on or after date_from"""
    sensor_ids = []
    active_locations = set()  # Track unique active locations

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
        if location_name is not None:
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

    if log_summary:
        if active_locations:
            logging.info(
                f"Found {len(active_locations)} active locations in {city['name']}: "
                f"{', '.join(sorted(active_locations))}"
            )
        else:
            logging.info(f"No active locations found in {city['name']}")

    return sensor_ids


def _get_locations_with_sensors(city, session, date_from: datetime) -> list:
    """Get all sensor IDs for a given city location"""
    try:
        locations = _fetch_locations(city, session)
        return _sensors_from_locations(locations, city, date_from)
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to get locations for {city['name']}: {str(e)}")
        return []


def _measurements_url(sensor_id, date_from, date_to, page: int = 1) -> str:
    # Ensure dates are in UTC and format them correctly
    query_params = {
        "datetime_from": date_from.strftime(OPEN_AQ_DATE_FORMAT),
        "datetime_to": date_to.strftime(OPEN_AQ_DATE_FORMAT),
        "limit": MEASUREMENTS_PAGE_LIMIT,
        "page": page,
    }

    return "{}/{}?{}".format(
        os.environ.get("OPEN_AQ_API_URL"),
        MEASUREMENTS_PATH.format(sensor_id=sensor_id),
        urlencode(query_params),
    )


def _transform_measurement(m, sensor_info) -> dict | None:
    """Transform a v3 hourly result to the v2 API format, or None if unusable"""
    period = m.get("period", {})
    datetime_from = period.get("datetimeFrom", {})
    datetime_to = period.get("datetimeTo", {})
    parameter = m.get("parameter", {})
    summary = m.get("summary", {})

    # Skip measurements without average value
    if "avg" not in summary:
        return None

    logging.debug(
        f"Processing measurement from {datetime_from.get('utc')} "
        f"to {datetime_to.get('utc')}"
    )

    return {
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
            "reference grade" if sensor_info["is_monitor"] else "not reference grade"
        ),
    }


def _get_measurements_for_sensor(
    sensor_info, date_from, date_to, session, city
) -> list:
    """Get measurements for a specific sensor ID"""
    url = _measurements_url(sensor_info["id"], date_from, date_to)
    headers = {"X-API-Key": os.environ.get("OPEN_AQ_API_KEY")}

    try:
        response = _make_request(session, url, headers)
        measurements_found = response.json().get("meta", {}).get("found", 0)
        logging.info(
            f"Found {measurements_found} {sensor_info['parameter']} measurements for sensor {sensor_info['id']} in city {city['name']} at location {sensor_info['location_name']}"
        )
        response.raise_for_status()
        measurements = response.json().get("results", [])

        transformed_measurements = []
        for m in measurements:
            transformed = _transform_measurement(m, sensor_info)
            if transformed is not None:
                transformed_measurements.append(transformed)

        return transformed_measurements
    except requests.exceptions.RequestException as e:
        logging.error(
            f"Failed to get measurements for sensor {sensor_info['id']}: {str(e)}"
        )
        return []


def fetch_sensor_measurements_between(
    sensor_info, date_from: datetime, date_to: datetime, session
) -> list[tuple[str, dict]]:
    """
    Get all hourly measurements for a sensor over any time range, following
    pagination. Returns (period start utc, transformed measurement) pairs in API
    order. Request failures are raised rather than swallowed so that callers
    never mistake missing data for an empty result.
    """
    headers = {"X-API-Key": os.environ.get("OPEN_AQ_API_KEY")}
    results = []
    page = 1
    while True:
        url = _measurements_url(sensor_info["id"], date_from, date_to, page)
        response = _make_request(session, url, headers)
        page_results = response.json().get("results", [])
        for m in page_results:
            transformed = _transform_measurement(m, sensor_info)
            if transformed is not None:
                period_from = m.get("period", {}).get("datetimeFrom", {}).get("utc")
                results.append((period_from, transformed))

        if len(page_results) < MEASUREMENTS_PAGE_LIMIT:
            return results
        page += 1


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
