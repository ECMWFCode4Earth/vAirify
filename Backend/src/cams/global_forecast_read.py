import xarray as xr


def extract_value(data_array, city):
    return data_array.sel(
        indexers={'latitude': city["latitude"], 'longitude': city["longitude"]},
        method='nearest'
    ).values


def extract(file: str, cities):
    dataset = xr.open_dataset(file, decode_times=False, engine='cfgrib', backend_kwargs={'indexpath':''})
    da_pm10 = dataset['pm10']
    da_pm2_5 = dataset['pm2p5']
    da_ozone = dataset['gtco3']
    da_no2 = dataset['tcno2']
    da_so2 = dataset['tcso2']

    for city in cities:
        go3_value = extract_value(da_ozone, city)
        no2_value = extract_value(da_no2, city)
        so2_value = extract_value(da_so2, city)
        pm10_value = extract_value(da_pm10, city)
        pm2p5_value = extract_value(da_pm2_5, city)
        city_name = city["name"]
        print(f'ozone value for {city_name} is {go3_value}')
        print(f'nitrogen dioxide value for {city_name} is {no2_value}')
        print(f'sulphur dioxide value for {city_name} is {so2_value}')
        print(f'pm10 value for {city_name} is {pm10_value}')
        print(f'pm2.5 value for {city_name} is {pm2p5_value}')
        print()

