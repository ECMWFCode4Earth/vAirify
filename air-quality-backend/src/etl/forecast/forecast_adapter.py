from datetime import datetime
from decimal import Decimal
from numpy import ndarray
from xarray import DataArray
from .forecast_data import ForecastData, ForecastDataType


# Convert longitude values to range of 0 - 360
def convert_longitude_east_range(longitude_value: float) -> float:
    if -180 <= longitude_value < 0:
        return longitude_value + 360
    return longitude_value


def find_value_for_city(data_array: DataArray, latitude: float, longitude: float) -> ndarray:
    return data_array.sel(
        indexers={'latitude': latitude, 'longitude': convert_longitude_east_range(longitude)},
        method='nearest'
    ).values


def transform(forecast_data: ForecastData, cities):
    step_values = forecast_data.get_step_values()
    time_value = forecast_data.get_time_value()
    formatted_dataset = []

    for city in cities:
        city_forecast_data_by_type = {}
        city_name = city["name"]

        for forecast_data_type in ForecastDataType:
            global_data = forecast_data.get_data(forecast_data_type)
            pollutant_values_kg_m3 = find_value_for_city(global_data, city["latitude"], city["longitude"]).tolist()
            pollutant_values_ug_m3 = [float(Decimal(str(x)) * Decimal(10**9)) for x in pollutant_values_kg_m3]
            city_forecast_data_by_type[forecast_data_type] = pollutant_values_ug_m3

        for i in range(0, step_values.size):
            measurement_timestamp = time_value + (float(step_values[i]) * 60 * 60)
            measurement_date = datetime.utcfromtimestamp(measurement_timestamp)
            formatted_dataset.append(
                {
                    "city": city_name,
                    "city_location": {"type": "Point", "coordinates": [city["longitude"], city["latitude"]]},
                    "measurement_date": measurement_date,
                    "o3": city_forecast_data_by_type[ForecastDataType.OZONE][i],
                    "no2": city_forecast_data_by_type[ForecastDataType.NITROGEN_DIOXIDE][i],
                    "so2": city_forecast_data_by_type[ForecastDataType.SULPHUR_DIOXIDE][i],
                    "pm10": city_forecast_data_by_type[ForecastDataType.PARTICULATE_MATTER_10][i],
                    "pm2_5": city_forecast_data_by_type[ForecastDataType.PARTICULATE_MATTER_2_5][i]
                }
            )

    return formatted_dataset
