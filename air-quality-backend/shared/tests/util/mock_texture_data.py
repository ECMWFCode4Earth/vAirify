from datetime import datetime, UTC

from shared.src.database.forecasts import DataTexture


def create_mock_texture_document(overrides) -> DataTexture:
    default_document = {
        "time_start": datetime(2024, 7, 24, 0, 0).astimezone(UTC),
        "source": "cams-production",
        "forecast_base_time": datetime(2024, 7, 24, 1, 0).astimezone(UTC),
        "variable": "no2",
        "time_end": datetime(2024, 7, 25, 21, 0).astimezone(UTC),
        "chunk": "1 of 3",
        "max_value": 100.0,
        "min_value": 0.0,
        "texture_uri": "/app/data_textures/2024-07-24_00/no2_2024-07-24_00_CAMS",
        "units": "kg m**-3 * 1e-9",
    }
    return {**default_document, **overrides}
