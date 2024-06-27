import os
from dateutil.parser import parse
from unittest import mock

from freezegun import freeze_time

from air_quality.database.in_situ import InSituMeasurement
from system_tests.in_situ_etl_suite.open_aq_data_creator import (
    create_open_aq_measurement,
)
from system_tests.in_situ_etl_suite.open_aq_etl_tests import (
    assert_pollutant_value,
)
from system_tests.utils.database_utilities import (
    get_database_data,
    delete_database_data,
)
from scripts.run_in_situ_etl import main

from dotenv import load_dotenv

from system_tests.utils.file_utilities import write_to_file

open_aq_cache_location = "system_tests/in_situ_etl_suite"
collection_name = "in_situ_data"
load_dotenv()


@mock.patch.dict(
    os.environ,
    {"OPEN_AQ_CITIES": "Paris", "OPEN_AQ_CACHE": open_aq_cache_location},
)
@freeze_time("2024-06-27T13:00:00")
def test__in_situ_etl__converts_ppm_to_ugm3_correctly():
    query = {"name": "Paris"}
    delete_database_data(collection_name, query)

    paris_file = f"{open_aq_cache_location}/Paris_2024062613_2024062713.json"
    date_utc = "2024-06-26T13:10:20+00:00"
    paris_openaq_data = [
        create_measurement(
            date_utc,
            "no2",
            1000,
            "ppm",
        ),
        create_measurement(
            date_utc,
            "o3",
            1000,
            "µg/m³",
        ),
        create_measurement(
            date_utc,
            "so2",
            1,
            "ppm",
        ),
        create_measurement(
            date_utc,
            "pm25",
            1,
            "µg/m³",
        ),
        create_measurement(
            date_utc,
            "pm10",
            15.7,
            "ppm",
        ),
    ]

    write_to_file(paris_openaq_data, paris_file)
    main()
    os.remove(paris_file)

    results = get_database_data(collection_name, query)
    assert len(results) == 1
    stored: InSituMeasurement = results[0]

    assert stored["location_name"] == paris_openaq_data[0]["location"]
    assert_pollutant_value(stored["no2"], 1)


def create_measurement(
    date_str: str, pollutant: str, value: float, unit: str, location: str = "Paris"
):
    overrides = {
        "location": f"{location}_test_station",
        "date": {"utc": date_str},
        "value": value,
        "unit": unit,
        "parameter": pollutant,
    }
    return create_open_aq_measurement(overrides)
