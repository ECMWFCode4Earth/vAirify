from datetime import UTC
from typing import List

from src.types import MeasurementDto, MeasurementSummaryDto
from shared.src.aqi.calculator import get_pollutant_index_level, get_overall_aqi_level
from shared.src.aqi.pollutant_type import PollutantType
from shared.src.database.in_situ import InSituMeasurement, InSituAveragedMeasurement


def map_measurement(measurement: InSituMeasurement) -> MeasurementDto:
    return {
        "measurement_date": measurement["measurement_date"].astimezone(UTC),
        "location_type": measurement["location_type"],
        "location_name": measurement["name"],
        "location": {
            "longitude": measurement["location"]["coordinates"][0],
            "latitude": measurement["location"]["coordinates"][1],
        },
        **{
            pollutant_type.value: measurement[pollutant_type.literal()]["value"]
            for pollutant_type in PollutantType
            if pollutant_type.value in measurement
        },
        "api_source": measurement["api_source"],
        "entity": measurement["metadata"]["entity"],
        "sensor_type": measurement["metadata"]["sensor_type"],
        "site_name": measurement["location_name"],
    }


def map_measurements(measurements: list[InSituMeasurement]) -> list[MeasurementDto]:
    return list(map(map_measurement, measurements))


def map_summarized_measurement(
    measurement: InSituAveragedMeasurement,
) -> MeasurementSummaryDto:
    pollutant_data = {}
    mean_aqi_values = []
    for pollutant_type in PollutantType:
        pollutant_value = pollutant_type.literal()
        avg_value = measurement[pollutant_value]["mean"]
        if avg_value is not None:
            aqi = get_pollutant_index_level(
                avg_value,
                pollutant_type,
            )
            if pollutant_value not in pollutant_data:
                pollutant_data[pollutant_value] = {}
            pollutant_data[pollutant_value]["mean"] = {
                "aqi_level": aqi,
                "value": avg_value,
            }
            mean_aqi_values.append(aqi)

    return {
        "measurement_base_time": measurement["measurement_base_time"],
        "location_type": measurement["location_type"],
        "location_name": measurement["name"],
        "overall_aqi_level": {"mean": get_overall_aqi_level(mean_aqi_values)},
        **pollutant_data,
    }


def map_summarized_measurements(
    averages: List[InSituAveragedMeasurement],
) -> List[MeasurementSummaryDto]:
    return list(map(map_summarized_measurement, averages))
