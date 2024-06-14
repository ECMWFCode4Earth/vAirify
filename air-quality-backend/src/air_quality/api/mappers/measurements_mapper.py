from datetime import UTC
from typing import Literal, List

from air_quality.api.types import MeasurementDto, MeasurementSummaryDto
from air_quality.aqi.calculator import get_pollutant_index_level, get_overall_aqi_level
from air_quality.aqi.pollutant_type import PollutantType
from air_quality.database.in_situ import InSituMeasurement, InSituAveragedMeasurement


def map_measurement(measurement: InSituMeasurement) -> MeasurementDto:
    return {
        "measurement_date": measurement["measurement_date"].astimezone(UTC),
        "location_type": measurement["location_type"],
        "location_name": measurement["name"],
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
    average_data: list[tuple[Literal["mean", "median"], list[int]]] = [
        ("mean", []),
        ("median", []),
    ]
    for pollutant_type in PollutantType:
        pollutant_value = pollutant_type.literal()
        for avg_type, aqi_values in average_data:
            avg_value = measurement[pollutant_value][avg_type]
            if avg_value is not None:
                aqi = get_pollutant_index_level(
                    avg_value,
                    pollutant_type,
                )
                if pollutant_value not in pollutant_data:
                    pollutant_data[pollutant_value] = {}
                pollutant_data[pollutant_value][avg_type] = {
                    "aqi_level": aqi,
                    "value": avg_value,
                }
                aqi_values.append(aqi)

    return {
        "measurement_base_time": measurement["measurement_base_time"],
        "location_type": measurement["location_type"],
        "location_name": measurement["name"],
        "overall_aqi_level": {
            avg_type: get_overall_aqi_level(aqi_values)
            for avg_type, aqi_values in average_data
        },
        **pollutant_data,
    }


def map_summarized_measurements(
    averages: List[InSituAveragedMeasurement],
) -> List[MeasurementSummaryDto]:
    return list(map(map_summarized_measurement, averages))
