from datetime import datetime, timezone
from unittest.mock import patch

from src.mappers.measurements_mapper import (
    map_measurements,
    map_summarized_measurements,
)
from shared.tests.util.mock_measurement import (
    create_mock_measurement_document,
    create_mock_averaged_measurement_document,
)


def test__map_measurements():
    result = map_measurements(
        [
            create_mock_measurement_document(
                {
                    "no2": {"value": 0.0},
                    "o3": {"value": 0.0},
                    "pm10": {"value": 0.0},
                    "pm2_5": {"value": 0.0},
                    "so2": {"value": 0.0},
                }
            )
        ]
    )
    assert result == [
        {
            "measurement_date": datetime(2024, 6, 4, 0, 0, tzinfo=timezone.utc),
            "location_type": "city",
            "location_name": "City Name",
            "location": {"longitude": 0, "latitude": 10},
            "no2": 0.0,
            "o3": 0.0,
            "pm10": 0.0,
            "pm2_5": 0.0,
            "so2": 0.0,
            "api_source": "test api",
            "entity": "Entity",
            "sensor_type": "Test Sensor",
            "site_name": "location",
        },
    ]


@patch(
    "src.mappers.measurements_mapper.get_pollutant_index_level",
    return_value=1.0,
)
@patch(
    "src.mappers.measurements_mapper.get_overall_aqi_level",
    return_value=2.0,
)
def test__map_summarized_measurements(m1, m2):
    result = map_summarized_measurements(
        [
            create_mock_averaged_measurement_document(
                {
                    "o3": {"mean": 0.0},
                    "no2": {"mean": None},
                    "so2": {"mean": None},
                    "pm2_5": {"mean": None},
                    "pm10": {"mean": None},
                }
            )
        ]
    )
    assert result == [
        {
            "measurement_base_time": datetime(2024, 6, 4, 0, 0, tzinfo=timezone.utc),
            "location_type": "city",
            "location_name": "City Name",
            "overall_aqi_level": {"mean": 2.0},
            "o3": {
                "mean": {"aqi_level": 1, "value": 0.0},
            },
        },
    ]
