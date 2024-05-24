from datetime import datetime, timezone
from air_quality.etl.in_situ.openaq_adapter import (
    transform,
)
from .mock_openaq_data import create_measurement, create_transform_input

cities = [
    {"name": "Dublin", "latitude": 53.350140, "longitude": -6.266155, "type": "city"},
    {"name": "London", "latitude": 51.509865, "longitude": -0.118092, "type": "city"},
]


def test__transform__multiple_cities():
    result = transform(
        create_transform_input(
            [
                (
                    cities[0],
                    [
                        create_measurement(
                            (1, "Dublin 1", 53.34187500024688, -6.2140750004382745),
                            "2024-04-21T00:00:00+00:00",
                            "so2",
                            14.0,
                        ),
                        create_measurement(
                            (1, "Dublin 1", 53.34187500024688, -6.2140750004382745),
                            "2024-04-21T00:00:00+00:00",
                            "pm25",
                            11.0,
                        ),
                    ],
                ),
                (
                    cities[1],
                    [
                        create_measurement(
                            (2, "London 1", 51.52228999923011, -0.12588900021133392),
                            "2024-04-21T00:00:00+00:00",
                            "so2",
                            144.0,
                        ),
                        create_measurement(
                            (2, "London 1", 51.52228999923011, -0.12588900021133392),
                            "2024-04-21T00:00:00+00:00",
                            "pm25",
                            53.0,
                        ),
                    ],
                ),
            ]
        )
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
            "pm2_5": 11.0,
            "so2": 14.0,
        },
        {
            "api_source": "OpenAQ",
            "name": "London",
            "location_type": "city",
            "location_name": "London 1",
            "location": {
                "coordinates": [-0.12588900021133392, 51.52228999923011],
                "type": "Point",
            },
            "measurement_date": datetime(2024, 4, 21, 0, 0, tzinfo=timezone.utc),
            "metadata": {
                "entity": "Governmental Organization",
                "sensor_type": "reference grade",
            },
            "pm2_5": 53.0,
            "so2": 144.0,
        },
    ]


def test__transform__multiple_sites_in_city():
    result = transform(
        create_transform_input(
            [
                (
                    cities[0],
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
                )
            ]
        )
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
            "so2": 14.0,
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
            "so2": 11.0,
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
            "so2": 12.0,
        },
    ]


def test__transform__all_five_pollutants():
    result = transform(
        create_transform_input(
            [
                (
                    cities[0],
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
                        ),
                    ],
                )
            ]
        )
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
            "no2": 1.0,
            "o3": 2.0,
            "pm10": 4.0,
            "pm2_5": 5.0,
            "so2": 3.0,
        }
    ]
