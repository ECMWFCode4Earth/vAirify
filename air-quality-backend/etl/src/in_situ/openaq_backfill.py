"""
Bulk pre-fetching of OpenAQ data for backfilling in-situ measurements.

The cron ETL asks OpenAQ for one 24 hour window at a time, which costs one
request per sensor per day. Here every sensor is requested once for a long time
range and the results are split into exactly the windows the cron would have
requested. Each window is written to the cron's existing OPEN_AQ_CACHE file
format, so the unchanged cron pipeline can then transform, enrich and store it.

Window membership mirrors the OpenAQ v3 hourly endpoint, which returns hours
with period start >= datetime_from and period end <= datetime_to.
"""

import bisect
import json
import logging
import os
from datetime import datetime, timedelta

from .openaq_dao import (
    OPEN_AQ_DATE_FORMAT,
    _fetch_locations,
    _sensors_from_locations,
    cache_file_path,
    fetch_sensor_measurements_between,
)

IN_SITU_WINDOW_HOURS = 24
DEFAULT_CHUNK_DAYS = 40  # 40 days of hourly data fits in a single page


def to_windows(dates: list[datetime]) -> list[tuple[datetime, datetime]]:
    """The (start, end) windows the cron requests for each date, sorted"""
    window = timedelta(hours=IN_SITU_WINDOW_HOURS)
    windows = sorted({(date - window, date) for date in dates})
    for previous, following in zip(windows, windows[1:]):
        if following[0] < previous[1]:
            raise ValueError(
                f"Overlapping in situ windows {previous} and {following} are not "
                f"supported by the backfill"
            )
    return windows


def chunk_windows(
    windows: list[tuple[datetime, datetime]], chunk_days: int = DEFAULT_CHUNK_DAYS
) -> list[list[tuple[datetime, datetime]]]:
    """Group sorted windows so that each group spans at most chunk_days"""
    max_span = timedelta(days=chunk_days)
    chunks = []
    for window in windows:
        if chunks and window[1] - chunks[-1][0][0] <= max_span:
            chunks[-1].append(window)
        else:
            chunks.append([window])
    return chunks


def _sensor_key(sensor_info) -> tuple:
    return sensor_info["id"], sensor_info["location_name"]


class _WindowCacheWriter:
    """Streams one window's measurements to its cache file as a JSON list"""

    def __init__(self, final_path: str):
        self.final_path = final_path
        self.tmp_path = f"{final_path}.tmp"
        self.file = open(self.tmp_path, "w", encoding="utf-8")
        self.file.write("[")
        self.count = 0

    def write(self, measurement: dict):
        if self.count > 0:
            self.file.write(",")
        json.dump(measurement, self.file)
        self.count += 1

    def commit(self):
        self.file.write("]")
        self.file.close()
        os.replace(self.tmp_path, self.final_path)

    def discard(self):
        self.file.close()
        if os.path.exists(self.tmp_path):
            os.remove(self.tmp_path)


def cache_city_windows(
    city,
    locations: list,
    windows: list[tuple[datetime, datetime]],
    cache_location: str,
    session,
):
    """
    Write the cache file for each window of a city that does not have one yet.
    Writes nothing for a window unless every request for it succeeded.
    """
    pending = [
        window
        for window in windows
        if not os.path.exists(cache_file_path(cache_location, city["name"], *window))
    ]
    if len(pending) == 0:
        return

    # The cron selects sensors per window by each location's last data time.
    # The earliest window selects a superset, in the same order, of every later one.
    sensors = _sensors_from_locations(locations, city, pending[0][0])
    sensors_per_window = [
        {
            _sensor_key(sensor)
            for sensor in _sensors_from_locations(
                locations, city, window[0], log_summary=False
            )
        }
        for window in pending
    ]
    window_starts = [window[0] for window in pending]

    writers = [
        _WindowCacheWriter(cache_file_path(cache_location, city["name"], *window))
        for window in pending
    ]
    try:
        for sensor in sensors:
            measurements = fetch_sensor_measurements_between(
                sensor, pending[0][0], pending[-1][1], session
            )
            key = _sensor_key(sensor)
            for period_from, measurement in measurements:
                period_start = datetime.strptime(period_from, OPEN_AQ_DATE_FORMAT)
                period_end = datetime.strptime(
                    measurement["date"]["utc"], OPEN_AQ_DATE_FORMAT
                )
                index = bisect.bisect_right(window_starts, period_start) - 1
                if (
                    index >= 0
                    and period_end <= pending[index][1]
                    and key in sensors_per_window[index]
                ):
                    writers[index].write(measurement)

        for writer in writers:
            writer.commit()
    except BaseException:
        for writer in writers:
            writer.discard()
        raise

    logging.info(
        f"Cached {sum(writer.count for writer in writers)} OpenAQ measurements "
        f"from {len(sensors)} sensors for {city['name']} "
        f"({len(pending)} windows)"
    )


def cache_openaq_chunk(
    cities,
    chunk: list[tuple[datetime, datetime]],
    cache_location: str,
    session,
    locations_by_city: dict,
):
    """Cache all cities for a chunk of windows, reusing fetched locations"""
    for index, city in enumerate(cities, start=1):
        if city["name"] not in locations_by_city:
            locations_by_city[city["name"]] = _fetch_locations(city, session)

        logging.info(
            f"[{index}/{len(cities)}] Caching OpenAQ data for {city['name']} from "
            f"{chunk[0][0]} to {chunk[-1][1]}"
        )
        cache_city_windows(
            city, locations_by_city[city["name"]], chunk, cache_location, session
        )
