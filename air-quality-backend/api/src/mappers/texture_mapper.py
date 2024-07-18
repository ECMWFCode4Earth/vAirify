from datetime import UTC
from typing import List

from src.types import TextureDto
from shared.src.database.forecasts import DataTexture


def database_to_api_result(measurement: DataTexture) -> TextureDto:
    return {
        "base_time": measurement["forecast_base_time"].astimezone(UTC),
        "variable": measurement["variable"],
        "time_start": measurement["time_start"],
        "time_end": measurement["time_end"],
        "chunk": measurement["chunk"],
        "source": measurement["source"],
        "chunk": measurement["chunk"],
        "texture_uri": measurement["texture_uri"],
        "min_value": measurement["min_value"],
        "max_value": measurement["max_value"],
    }


def map_texture(measurements_from_database: List[DataTexture]) -> List[TextureDto]:
    return list(map(database_to_api_result, measurements_from_database))
