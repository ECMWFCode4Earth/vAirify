from datetime import datetime, timezone
from air_quality.etl.in_situ.openaq_adapter import (
    transform_city,
)
from .mock_openaq_data import create_measurement

city = {"name": "Dublin", "latitude": 53.350140, "longitude": -6.266155, "type": "city"}


def test__transform_city__multiple_sites_in_city():
    result = transform_city(
        {
            "city": city,
            "measurements":
            [
                create_measurement(
                    (1, "Dublin 1", 0.0, 0.0),
                    "2024-04-21T00:00:00+00:00",
                    "so2",
                    14.0,
                ),
                create_measurement(
                    (1, "Dublin 2", 1.0, 1.0),
                    "2024-04-21T00:00:00+00:00",
                    "so2",
                    11.0,
                ),
                create_measurement(
                    (1, "Dublin 2", 1.0, 1.0),
                    "2024-04-21T03:00:00+00:00",
                    "so2",
                    12.0,
                ),
            ],
        }
    )
    assert result == [
        {
            "api_source": "OpenAQ",
            "name": "Dublin",
            "location_type": "city",
            "location_name": "Dublin 1",
            "location": {
                "coordinates": [0.0, 0.0],
                "type": "Point",
            },
            "measurement_date": datetime(2024, 4, 21, 0, 0, tzinfo=timezone.utc),
            "metadata": {
                "entity": "Governmental Organization",
                "sensor_type": "reference grade",
            },
            "so2": {
                "value": 14.0,
                "unit": "µg/m³",
                "original_value": 14.0,
                "original_unit": "µg/m³"
            }
        },
        {
            "api_source": "OpenAQ",
            "name": "Dublin",
            "location_type": "city",
            "location_name": "Dublin 2",
            "location": {
                "coordinates": [1.0, 1.0],
                "type": "Point",
            },
            "measurement_date": datetime(2024, 4, 21, 0, 0, tzinfo=timezone.utc),
            "metadata": {
                "entity": "Governmental Organization",
                "sensor_type": "reference grade",
            },
            "so2": {
                "value": 11.0,
                "unit": "µg/m³",
                "original_value": 11.0,
                "original_unit": "µg/m³"
            }
        },
        {
            "api_source": "OpenAQ",
            "name": "Dublin",
            "location_type": "city",
            "location_name": "Dublin 2",
            "location": {
                "coordinates": [1.0, 1.0],
                "type": "Point",
            },
            "measurement_date": datetime(2024, 4, 21, 3, 0, tzinfo=timezone.utc),
            "metadata": {
                "entity": "Governmental Organization",
                "sensor_type": "reference grade",
            },
            "so2": {
                "value": 12.0,
                "unit": "µg/m³",
                "original_value": 12.0,
                "original_unit": "µg/m³"
            }
        },
    ]


def test__transform_city__all_five_pollutants():
    result = transform_city(
        {
            "city": city,
            "measurements":
            [
                create_measurement(
                    (1, "Dublin 1", 53.34187500024688, -6.2140750004382745),
                    "2024-04-21T00:00:00+00:00",
                    "no2",
                    1.0,
                ),
                create_measurement(
                    (1, "Dublin 1", 53.34187500024688, -6.2140750004382745),
                    "2024-04-21T00:00:00+00:00",
                    "o3",
                    2.0,
                ),
                create_measurement(
                    (1, "Dublin 1", 53.34187500024688, -6.2140750004382745),
                    "2024-04-21T00:00:00+00:00",
                    "so2",
                    3.0,
                ),
                create_measurement(
                    (1, "Dublin 1", 53.34187500024688, -6.2140750004382745),
                    "2024-04-21T00:00:00+00:00",
                    "pm10",
                    4.0,
                ),
                create_measurement(
                    (1, "Dublin 1", 53.34187500024688, -6.2140750004382745),
                    "2024-04-21T00:00:00+00:00",
                    "pm25",
                    5.0,
                )
            ]
        }
    )
    assert result == [
        {
            "api_source": "OpenAQ",
            "name": "Dublin",
            "location_type": "city",
            "location_name": "Dublin 1",
            "location": {
                "coordinates": [-6.2140750004382745, 53.34187500024688],
                "type": "Point",
            },
            "measurement_date": datetime(2024, 4, 21, 0, 0, tzinfo=timezone.utc),
            "metadata": {
                "entity": "Governmental Organization",
                "sensor_type": "reference grade",
            },
            "no2": {
                "value": 1.0,
                "unit": "µg/m³",
                "original_value": 1.0,
                "original_unit": "µg/m³"
            },
            "o3": {
                "value": 2.0,
                "unit": "µg/m³",
                "original_value": 2.0,
                "original_unit": "µg/m³"
            },
            "pm10": {
                "value": 4.0,
                "unit": "µg/m³",
                "original_value": 4.0,
                "original_unit": "µg/m³"
            },
            "pm2_5": {
                "value": 5.0,
                "unit": "µg/m³",
                "original_value": 5.0,
                "original_unit": "µg/m³"
            },
            "so2": {
                "value": 3.0,
                "unit": "µg/m³",
                "original_value": 3.0,
                "original_unit": "µg/m³"
            },
        }
    ]
