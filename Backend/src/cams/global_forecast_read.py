import xarray as xr


def extract_value(data_array, city):
    return data_array.sel(
        indexers={'latitude': city["latitude"], 'longitude': city["longitude"]},
        method='nearest'
    ).values


def extract(file: str, cities):
    dataset = xr.open_dataset(file, decode_times=False, engine='cfgrib', backend_kwargs={'indexpath': ''})
    da_pm10 = dataset['pm10']
    da_pm2_5 = dataset['pm2p5']
    da_ozone = dataset['gtco3']
    da_no2 = dataset['tcno2']
    da_so2 = dataset['tcso2']

    formatted_dataset = []

    for city in cities:
        go3_value = extract_value(da_ozone, city)
        no2_value = extract_value(da_no2, city)
        so2_value = extract_value(da_so2, city)
        pm10_value = extract_value(da_pm10, city)
        pm2p5_value = extract_value(da_pm2_5, city)
        city_name = city["name"]

        for i in range(0, dataset['step'].values.size):
            formatted_dataset.append(
                {
                    "city": city_name,
                    "city_location": {"type": "Point", "coordinates": [city["longitude"], city["latitude"]]},
                    "measurement_date": int(dataset["time"].values) + (float(dataset['step'].values[i]) * 60 * 60),
                    "o3": go3_value.tolist()[i],
                    "no2": no2_value.tolist()[i],
                    "so2": so2_value.tolist()[i],
                    "pm10": pm10_value.tolist()[i],
                    "pm2_5": pm2p5_value.tolist()[i]
                }
            )

    return formatted_dataset
