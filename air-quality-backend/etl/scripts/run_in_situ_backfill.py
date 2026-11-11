import json
import logging
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from logging import config

from dotenv import load_dotenv

from etl.scripts.run_in_situ_etl import get_cities, process_in_situ_date
from etl.src.in_situ.openaq_backfill import (
    DEFAULT_CHUNK_DAYS,
    cache_openaq_chunk,
    chunk_windows,
    to_windows,
)
from etl.src.in_situ.openaq_dao import _create_session, cache_file_path, rate_limiter
from etl.src.in_situ.openaq_date_retriever import (
    retrieve_dates_requiring_in_situ_data,
)

config.fileConfig("./logging.ini")

DEFAULT_BACKFILL_DIR = "./in_situ_backfill"
# 2,000 requests/hour and 60/minute are OpenAQ's free tier limits
DEFAULT_MIN_REQUEST_INTERVAL_SECONDS = 1.85
BACKFILL_RATE_LIMIT_RETRIES = 12
DATES_FILE = "backfill_dates.json"
PROCESSED_FILE = "processed_dates.txt"


def _load_or_create_dates(backfill_dir: str) -> list[datetime]:
    # The windows depend on the hour the run starts, so they are fixed on the
    # first run and reused when resuming to keep matching the cache files.
    dates_path = os.path.join(backfill_dir, DATES_FILE)
    if os.path.exists(dates_path):
        with open(dates_path, encoding="utf-8") as f:
            dates = [datetime.fromisoformat(date) for date in json.load(f)]
        logging.info(f"Resuming backfill of {len(dates)} windows from {dates_path}")
        return dates

    dates = retrieve_dates_requiring_in_situ_data()
    with open(dates_path, "w", encoding="utf-8") as f:
        json.dump([date.isoformat() for date in dates], f)
    return dates


def _load_processed(backfill_dir: str) -> set[datetime]:
    processed_path = os.path.join(backfill_dir, PROCESSED_FILE)
    if not os.path.exists(processed_path):
        return set()
    with open(processed_path, encoding="utf-8") as f:
        return {datetime.fromisoformat(line.strip()) for line in f if line.strip()}


def _mark_processed(backfill_dir: str, date: datetime):
    with open(os.path.join(backfill_dir, PROCESSED_FILE), "a", encoding="utf-8") as f:
        f.write(f"{date.isoformat()}\n")


def _remove_window_cache(backfill_dir: str, cities, window):
    for city in cities:
        path = cache_file_path(backfill_dir, city["name"], *window)
        if os.path.exists(path):
            os.remove(path)


def _cache_chunk(cities, chunk, backfill_dir, locations_by_city):
    cache_openaq_chunk(
        cities,
        chunk,
        backfill_dir,
        _create_session(retry_server_errors=True),
        locations_by_city,
    )


def main():
    load_dotenv()

    backfill_dir = os.environ.get("IN_SITU_BACKFILL_DIR", DEFAULT_BACKFILL_DIR)
    chunk_days = int(os.environ.get("IN_SITU_BACKFILL_CHUNK_DAYS", DEFAULT_CHUNK_DAYS))
    rate_limiter.min_interval_seconds = float(
        os.environ.get(
            "OPEN_AQ_MIN_REQUEST_INTERVAL", DEFAULT_MIN_REQUEST_INTERVAL_SECONDS
        )
    )
    rate_limiter.max_rate_limit_retries = BACKFILL_RATE_LIMIT_RETRIES

    os.makedirs(backfill_dir, exist_ok=True)
    # The cron pipeline reads each city's 24 hour window from this cache
    os.environ["OPEN_AQ_CACHE"] = backfill_dir

    cities = get_cities()
    dates = _load_or_create_dates(backfill_dir)
    processed = _load_processed(backfill_dir)
    windows = [window for window in to_windows(dates) if window[1] not in processed]
    chunks = chunk_windows(windows, chunk_days)
    logging.info(
        f"Backfilling {len(windows)} windows ({len(processed)} already done) "
        f"in {len(chunks)} chunks of up to {chunk_days} days"
    )

    locations_by_city = {}
    # Prefetch the next chunk from OpenAQ while the current one is enriched
    # with CAMS data and stored.
    with ThreadPoolExecutor(max_workers=1) as executor:
        next_cache = (
            executor.submit(
                _cache_chunk, cities, chunks[0], backfill_dir, locations_by_city
            )
            if chunks
            else None
        )
        for index, chunk in enumerate(chunks):
            next_cache.result()
            if index + 1 < len(chunks):
                next_cache = executor.submit(
                    _cache_chunk,
                    cities,
                    chunks[index + 1],
                    backfill_dir,
                    locations_by_city,
                )

            logging.info(
                f"Storing chunk {index + 1}/{len(chunks)}: "
                f"{chunk[0][0]} to {chunk[-1][1]}"
            )
            for window in chunk:
                process_in_situ_date(cities, window[1])
                _mark_processed(backfill_dir, window[1])
                _remove_window_cache(backfill_dir, cities, window)

    for state_file in (DATES_FILE, PROCESSED_FILE):
        path = os.path.join(backfill_dir, state_file)
        if os.path.exists(path):
            os.remove(path)
    logging.info(f"Backfill complete. OpenAQ API calls: {rate_limiter.get_api_calls()}")


if __name__ == "__main__":
    main()
