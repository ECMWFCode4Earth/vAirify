from src.cams.forecast_dao import ForecastData, ForecastDataType
from decimal import Decimal
from numpy import ndarray
from xarray import DataArray


def find_value_for_city(data_array: DataArray, city) -> ndarray:
    return data_array.sel(
        indexers={'latitude': city["latitude"], 'longitude': city["longitude"]},
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
            pollutant_values_kg_m3 = find_value_for_city(global_data, city).tolist()
            pollutant_values_ug_m3 = [float(Decimal(str(x)) * Decimal(10**9)) for x in pollutant_values_kg_m3]
            city_forecast_data_by_type[forecast_data_type] = pollutant_values_ug_m3

        for i in range(0, step_values.size):
            formatted_dataset.append(
                {
                    "city": city_name,
                    "city_location": {"type": "Point", "coordinates": [city["longitude"], city["latitude"]]},
                    "measurement_date": time_value + (float(step_values[i]) * 60 * 60),
                    "o3": city_forecast_data_by_type[ForecastDataType.OZONE][i],
                    "no2": city_forecast_data_by_type[ForecastDataType.NITROGEN_DIOXIDE][i],
                    "so2": city_forecast_data_by_type[ForecastDataType.SULPHUR_DIOXIDE][i],
                    "pm10": city_forecast_data_by_type[ForecastDataType.PARTICULATE_MATTER_10][i],
                    "pm2_5": city_forecast_data_by_type[ForecastDataType.PARTICULATE_MATTER_2_5][i]
                }
            )

    return formatted_dataset
