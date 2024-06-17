import os
from dateutil.parser import parse
from unittest import mock

from freezegun import freeze_time

from system_tests.in_situ_etl_suite.open_aq_data_creator import (
    create_open_aq_measurement)
from system_tests.utils.database_utilities import (
    get_database_data, delete_database_data)
from scripts.run_in_situ_etl import main

from dotenv import load_dotenv

from system_tests.utils.file_utilities import write_to_file

open_aq_cache_location = "system_tests/in_situ_etl_suite"
collection_name = "in_situ_data"
load_dotenv()


@mock.patch.dict(
    os.environ,
    {
        "OPEN_AQ_CITIES": "London",
        "OPEN_AQ_CACHE": open_aq_cache_location
    },
)
@freeze_time("2024-05-25T13:00:00")
def test__in_situ_etl__combines_pollutants_for_location_times():
    query = {"name": "London"}
    delete_database_data(collection_name, query)

    date1 = "2024-05-24T13:10:20+00:00"
    date2 = "2024-05-25T13:10:20+00:00"
    london_file = f"{open_aq_cache_location}/London_2024052413_2024052513.json"

    london_data = [
        create_london_measurement(date1, "no2", 1),
        create_london_measurement(date1, "o3", 2),
        create_london_measurement(date2, "no2", 3),
        create_london_measurement(date2, "o3", 4),
    ]

    write_to_file(london_data, london_file)
    main()
    os.remove(london_file)

    results = get_database_data(collection_name, query)
    assert len(results) == 2

    assert results[0]["measurement_date"] == parse(date1)
    assert results[0]["no2"]["value"] == 1
    assert results[0]["o3"]["value"] == 2

    assert results[1]["measurement_date"] == parse(date2)
    assert results[1]["no2"]["value"] == 3
    assert results[1]["o3"]["value"] == 4


def create_london_measurement(date_str: str, pollutant: str, value: float):
    overrides = {
        "location": "london_test_station",
        "date": {
            "utc": date_str
        },
        "value": value,
        "parameter": pollutant
    }
    return create_open_aq_measurement(overrides)
