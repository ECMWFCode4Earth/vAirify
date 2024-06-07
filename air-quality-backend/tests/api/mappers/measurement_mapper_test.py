from datetime import datetime, timezone
from air_quality.api.mappers.measurements_mapper import map_measurements
from tests.util.mock_measurement import create_mock_measurement_document


def test_map_forecast_database_data_to_api_output_data():
    result = map_measurements([create_mock_measurement_document({})])
    assert result == [
        {
            "measurement_date": datetime(2024, 6, 4, 0, 0, tzinfo=timezone.utc),
            "location_type": "city",
            "location_name": "City Name",
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
