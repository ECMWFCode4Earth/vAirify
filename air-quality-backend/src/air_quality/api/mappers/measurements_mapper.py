from datetime import UTC
from air_quality.aqi.pollutant_type import PollutantType
from air_quality.database.in_situ import InSituMeasurement


def database_to_api_result(measurement: InSituMeasurement):
    return {
        "measurementDate": measurement["measurement_date"].astimezone(UTC),
        "locationType": measurement["location_type"],
        "locationName": measurement["name"],
        **{
            pollutant_type: measurement[pollutant_type.value]
            for pollutant_type in PollutantType
            if pollutant_type in measurement
        },
        "apiSource": measurement["api_source"],
        "entity": measurement["metadata"]["entity"],
        "sensorType": measurement["metadata"]["sensor_type"],
    }


def map_measurements(measurements: list[InSituMeasurement]):
    return list(map(database_to_api_result, measurements))
