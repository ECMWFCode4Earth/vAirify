from datetime import datetime
from decimal import Decimal
from numpy import ndarray
from xarray import DataArray
from .forecast_data import ForecastData
from src.etl.air_quality_index import calculator as aqi_calculator
from src.etl.air_quality_index.pollutant_type import PollutantType

required_pollutant_data = [
    ("o3", PollutantType.OZONE),
    ("no2", PollutantType.NITROGEN_DIOXIDE),
    ("so2", PollutantType.SULPHUR_DIOXIDE),
    ("pm10", PollutantType.PARTICULATE_MATTER_10),
    ("pm2_5", PollutantType.PARTICULATE_MATTER_2_5),
]


def convert_east_only_longitude_to_east_west(longitude_value: float) -> float:
    """
    Convert longitude value from range of 0 - 360 to -180 - 180
    """
    if 180 < longitude_value <= 360:
        return float(Decimal(str(longitude_value)) - Decimal("360"))
    return longitude_value


def find_value_for_city(
    data_array: DataArray, latitude: float, longitude: float
) -> ndarray:
    converted_data = data_array.assign_coords(
        longitude=list(
            map(
                lambda lon: convert_east_only_longitude_to_east_west(
                    lon.values.flat[0]
                ),
                data_array.longitude,
            )
        )
    )
    converted_data = converted_data.sortby("longitude")
    return converted_data.sel(
        indexers={
            "latitude": latitude,
            "longitude": longitude,
        },
        method="nearest",
    ).values


def _create_pollutant_dict(value: float, pollutant_type: PollutantType) -> dict:
    return {
        "aqi_level": aqi_calculator.get_pollutant_index_level(value, pollutant_type),
        "value": value,
    }


def _get_city_forecast_data_for_pollutant_type(
    global_data: DataArray, city, pollutant_type: PollutantType
) -> dict:
    pollutant_values_kg_m3 = find_value_for_city(
        global_data, city["latitude"], city["longitude"]
    ).tolist()
    pollutant_values_ug_m3 = [
        float(Decimal(str(x)) * Decimal(10**9)) for x in pollutant_values_kg_m3
    ]

    return {
        "pollutant_values_ug_m3": pollutant_values_ug_m3,
        "pollutant_aqi_values": list(
            map(
                lambda x: aqi_calculator.get_pollutant_index_level(x, pollutant_type),
                pollutant_values_ug_m3,
            )
        ),
    }


def transform(forecast_data: ForecastData, cities):
    step_values = forecast_data.get_step_values()
    time_value = forecast_data.get_time_value()
    formatted_dataset = []

    for city in cities:
        city_forecast_data_by_type = {}
        city_name = city["name"]

        for pollutant_type in PollutantType:
            global_data = forecast_data.get_data(pollutant_type)
            city_forecast_data_by_type[
                pollutant_type
            ] = _get_city_forecast_data_for_pollutant_type(
                global_data, city, pollutant_type
            )

        for i in range(0, step_values.size):
            measurement_timestamp = time_value + (float(step_values[i]) * 60 * 60)
            measurement_date = datetime.utcfromtimestamp(measurement_timestamp)

            overall_aqi_value = aqi_calculator.get_overall_aqi_level(
                list(
                    map(
                        lambda x: x["pollutant_aqi_values"][i],
                        city_forecast_data_by_type.values(),
                    )
                )
            )

            pollutant_data = {}
            for name, pollutant_type in required_pollutant_data:
                pollutant_data[name] = _create_pollutant_dict(
                    city_forecast_data_by_type[pollutant_type][
                        "pollutant_values_ug_m3"
                    ][i],
                    pollutant_type,
                )

            formatted_dataset.append(
                {
                    "city": city_name,
                    "city_location": {
                        "type": "Point",
                        "coordinates": [city["longitude"], city["latitude"]],
                    },
                    "measurement_date": measurement_date,
                    "overall_aqi_level": overall_aqi_value,
                    **pollutant_data,
                }
            )

    return formatted_dataset
