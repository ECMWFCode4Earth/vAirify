from datetime import datetime, UTC

from src.mappers.texture_mapper import map_texture
from shared.tests.util.mock_texture_data import create_mock_texture_document


def test__map_forecast_database_data_to_api_output_data():
    result = map_texture([create_mock_texture_document({})])
    expected = {
        "base_time": datetime(2024, 7, 24, 1, 0).astimezone(UTC),
        "variable": "no2",
        "time_start": datetime(2024, 7, 24, 0, 0).astimezone(UTC),
        "time_end": datetime(2024, 7, 25, 21, 0).astimezone(UTC),
        "chunk": "1 of 3",
        "source": "cams-production",
        "texture_uri": "/2024-07-24_00/no2_2024-07-24_00_CAMS",
        "min_value": 0.0,
        "max_value": 100.0,
    }
    assert result[0] == expected
