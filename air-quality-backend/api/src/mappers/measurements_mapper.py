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


def map_measurement_counts(measurements):
    """Map measurements to counts by city and pollutant, including unique location counts per pollutant"""
    counts = {}
    location_sets = {}  # Track unique locations per city and pollutant

    for measurement in measurements:
        city = measurement["name"]
        if city not in counts:
            counts[city] = {
                "so2": 0,
                "no2": 0,
                "o3": 0,
                "pm10": 0,
                "pm2_5": 0,
                "so2_locations": 0,
                "no2_locations": 0,
                "o3_locations": 0,
                "pm10_locations": 0,
                "pm2_5_locations": 0,
            }
            location_sets[city] = {
                "so2": set(),
                "no2": set(),
                "o3": set(),
                "pm10": set(),
                "pm2_5": set(),
            }

        location_name = measurement["location_name"]

        # Count measurements and track locations per pollutant
        if "so2" in measurement and measurement["so2"] is not None:
            counts[city]["so2"] += 1
            location_sets[city]["so2"].add(location_name)

        if "no2" in measurement and measurement["no2"] is not None:
            counts[city]["no2"] += 1
            location_sets[city]["no2"].add(location_name)

        if "o3" in measurement and measurement["o3"] is not None:
            counts[city]["o3"] += 1
            location_sets[city]["o3"].add(location_name)

        if "pm10" in measurement and measurement["pm10"] is not None:
            counts[city]["pm10"] += 1
            location_sets[city]["pm10"].add(location_name)

        if "pm2_5" in measurement and measurement["pm2_5"] is not None:
            counts[city]["pm2_5"] += 1
            location_sets[city]["pm2_5"].add(location_name)

    # Add location counts per pollutant to the final output
    for city in counts:
        for pollutant in ["so2", "no2", "o3", "pm10", "pm2_5"]:
            counts[city][f"{pollutant}_locations"] = len(location_sets[city][pollutant])

    return counts
