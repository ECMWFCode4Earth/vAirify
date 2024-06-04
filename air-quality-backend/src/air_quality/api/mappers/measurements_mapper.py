from datetime import UTC
from air_quality.aqi.pollutant_type import PollutantType
from air_quality.api.types import MeasurementDto
from air_quality.database.in_situ import InSituMeasurement


def database_to_api_result(measurement: InSituMeasurement) -> MeasurementDto:
    return {
        "measurement_date": measurement["measurement_date"].astimezone(UTC),
        "location_type": measurement["location_type"],
        "location_name": measurement["name"],
        **{
            pollutant_type.value: measurement[pollutant_type.value]
            for pollutant_type in PollutantType
            if pollutant_type.value in measurement
        },
        "api_source": measurement["api_source"],
        "entity": measurement["metadata"]["entity"],
        "sensor_type": measurement["metadata"]["sensor_type"],
        "site_name": measurement["location_name"],
    }


def map_measurements(measurements: list[InSituMeasurement]) -> list[MeasurementDto]:
    return list(map(database_to_api_result, measurements))
