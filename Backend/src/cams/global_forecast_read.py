from src.cams.global_forecast_fetch import ForecastData


def extract_value(data_array, city):
    return data_array.sel(
        indexers={'latitude': city["latitude"], 'longitude': city["longitude"]},
        method='nearest'
    ).values


def transform(forecast_data: ForecastData, cities):
    da_pm10 = forecast_data.single_level_data['pm10']
    da_pm2_5 = forecast_data.single_level_data['pm2p5']
    da_ozone = forecast_data.multi_level_data['go3']
    da_no2 = forecast_data.multi_level_data['no2']
    da_so2 = forecast_data.multi_level_data['so2']

    step_values = forecast_data.single_level_data['step'].values
    time_value = forecast_data.single_level_data['time'].values
    formatted_dataset = []

    for city in cities:
        go3_value = extract_value(da_ozone, city)
        no2_value = extract_value(da_no2, city)
        so2_value = extract_value(da_so2, city)
        pm10_value = extract_value(da_pm10, city)
        pm2p5_value = extract_value(da_pm2_5, city)
        city_name = city["name"]

        for i in range(0, step_values.size):
            formatted_dataset.append(
                {
                    "city": city_name,
                    "city_location": {"type": "Point", "coordinates": [city["longitude"], city["latitude"]]},
                    "measurement_date": int(time_value) + (float(step_values[i]) * 60 * 60),
                    "o3": go3_value.tolist()[i],
                    "no2": no2_value.tolist()[i],
                    "so2": so2_value.tolist()[i],
                    "pm10": pm10_value.tolist()[i],
                    "pm2_5": pm2p5_value.tolist()[i]
                }
            )

    return formatted_dataset
