import pytest

from air_quality.etl.in_situ.sort_in_situ import sort_by_distance_and_time
from tests.etl_tests.in_situ.mock_openaq_data import (
    openaq_dataset_to_sort_distance,
    openaq_dataset_to_sort_time,
)


@pytest.mark.parametrize(
    "latitude, longitude, expected",
    [
        (
            53.350140,
            -6.266155,
            [
                {
                    "city": None,
                    "coordinates": {
                        "latitude": 53.353888999745415,
                        "longitude": -6.278056000074956,
                    },
                    "country": "IE",
                    "date": {
                        "local": "2024-04-21T01:00:00+01:00",
                        "utc": "2024-04-22T00:00:00+00:00",
                    },
                    "entity": "Governmental Organization",
                    "isAnalysis": None,
                    "isMobile": False,
                    "location": "Dublin 1",
                    "locationId": 4837,
                    "parameter": "pm25",
                    "sensorType": "reference grade",
                    "unit": "µg/m³",
                    "value": 44.0,
                },
                {
                    "city": None,
                    "coordinates": {
                        "latitude": 53.34187500024688,
                        "longitude": -6.2140750004382745,
                    },
                    "country": "IE",
                    "date": {
                        "local": "2024-04-21T01:00:00+01:00",
                        "utc": "2024-04-21T00:00:00+00:00",
                    },
                    "entity": "Governmental Organization",
                    "isAnalysis": None,
                    "isMobile": False,
                    "location": "Dublin 2",
                    "locationId": 4837,
                    "parameter": "so2",
                    "sensorType": "reference grade",
                    "unit": "µg/m³",
                    "value": 14.0,
                },
                {
                    "city": None,
                    "coordinates": {
                        "latitude": 10.34187500024688,
                        "longitude": -77.21407500043827,
                    },
                    "country": "IE",
                    "date": {
                        "local": "2024-04-21T01:00:00+01:00",
                        "utc": "2024-04-21T00:00:00+00:00",
                    },
                    "entity": "Governmental Organization",
                    "isAnalysis": None,
                    "isMobile": False,
                    "location": "Dublin 2",
                    "locationId": 4837,
                    "parameter": "so2",
                    "sensorType": "reference grade",
                    "unit": "µg/m³",
                    "value": 14.0,
                },
            ],
        ),
        (
            9.34187500024688,
            -76.21407500043827,
            [
                {
                    "city": None,
                    "coordinates": {
                        "latitude": 10.34187500024688,
                        "longitude": -77.21407500043827,
                    },
                    "country": "IE",
                    "date": {
                        "local": "2024-04-21T01:00:00+01:00",
                        "utc": "2024-04-21T00:00:00+00:00",
                    },
                    "entity": "Governmental Organization",
                    "isAnalysis": None,
                    "isMobile": False,
                    "location": "Dublin 2",
                    "locationId": 4837,
                    "parameter": "so2",
                    "sensorType": "reference grade",
                    "unit": "µg/m³",
                    "value": 14.0,
                },
                {
                    "city": None,
                    "coordinates": {
                        "latitude": 53.353888999745415,
                        "longitude": -6.278056000074956,
                    },
                    "country": "IE",
                    "date": {
                        "local": "2024-04-21T01:00:00+01:00",
                        "utc": "2024-04-22T00:00:00+00:00",
                    },
                    "entity": "Governmental Organization",
                    "isAnalysis": None,
                    "isMobile": False,
                    "location": "Dublin 1",
                    "locationId": 4837,
                    "parameter": "pm25",
                    "sensorType": "reference grade",
                    "unit": "µg/m³",
                    "value": 44.0,
                },
                {
                    "city": None,
                    "coordinates": {
                        "latitude": 53.34187500024688,
                        "longitude": -6.2140750004382745,
                    },
                    "country": "IE",
                    "date": {
                        "local": "2024-04-21T01:00:00+01:00",
                        "utc": "2024-04-21T00:00:00+00:00",
                    },
                    "entity": "Governmental Organization",
                    "isAnalysis": None,
                    "isMobile": False,
                    "location": "Dublin 2",
                    "locationId": 4837,
                    "parameter": "so2",
                    "sensorType": "reference grade",
                    "unit": "µg/m³",
                    "value": 14.0,
                },
            ],
        ),
    ],
)
def test_sort_by_distance_and_time_input_sort_by_distance_list_returns_sorted_data(
    latitude: float, longitude: float, expected
):
    result = sort_by_distance_and_time(
        openaq_dataset_to_sort_distance, latitude, longitude
    )
    assert result == expected


def test_sort_by_distance_and_time_input_sort_by_time_list_returns_sorted_data():
    result = sort_by_distance_and_time(
        openaq_dataset_to_sort_time, 53.350140, -6.266155
    )
    assert result == [
        {
            "city": None,
            "coordinates": {
                "latitude": 53.353888999745415,
                "longitude": -6.278056000074956,
            },
            "country": "IE",
            "date": {
                "local": "2024-04-21T01:00:00+01:00",
                "utc": "2024-04-21T00:00:00+00:00",
            },
            "entity": "Governmental Organization",
            "isAnalysis": None,
            "isMobile": False,
            "location": "Dublin 1",
            "locationId": 4837,
            "parameter": "so2",
            "sensorType": "reference grade",
            "unit": "µg/m³",
            "value": 44.0,
        },
        {
            "city": None,
            "coordinates": {
                "latitude": 53.353888999745415,
                "longitude": -6.278056000074956,
            },
            "country": "IE",
            "date": {
                "local": "2024-04-21T01:00:00+01:00",
                "utc": "2024-04-22T00:00:00+00:00",
            },
            "entity": "Governmental Organization",
            "isAnalysis": None,
            "isMobile": False,
            "location": "Dublin 1",
            "locationId": 4837,
            "parameter": "pm25",
            "sensorType": "reference grade",
            "unit": "µg/m³",
            "value": 44.0,
        },
        {
            "city": None,
            "coordinates": {
                "latitude": 10.34187500024688,
                "longitude": -77.21407500043827,
            },
            "country": "IE",
            "date": {
                "local": "2024-04-21T01:00:00+01:00",
                "utc": "2024-04-21T00:00:00+00:00",
            },
            "entity": "Governmental Organization",
            "isAnalysis": None,
            "isMobile": False,
            "location": "Dublin 2",
            "locationId": 4837,
            "parameter": "so2",
            "sensorType": "reference grade",
            "unit": "µg/m³",
            "value": 14.0,
        },
        {
            "city": None,
            "coordinates": {
                "latitude": 10.34187500024688,
                "longitude": -77.21407500043827,
            },
            "country": "IE",
            "date": {
                "local": "2024-04-22T01:00:00+01:00",
                "utc": "2024-04-22T00:00:00+00:00",
            },
            "entity": "Governmental Organization",
            "isAnalysis": None,
            "isMobile": False,
            "location": "Dublin 2",
            "locationId": 4837,
            "parameter": "no3",
            "sensorType": "reference grade",
            "unit": "µg/m³",
            "value": 14.0,
        },
    ]
