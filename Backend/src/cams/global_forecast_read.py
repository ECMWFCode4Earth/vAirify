import xarray as xr

cities = [
    {'name': 'Dublin', 'latitude': 53.350140, 'longitude': -6.266155},
    {'name': 'London', 'latitude': 51.509865, 'longitude': -0.118092},
    {'name': 'Paris', 'latitude': 48.864716, 'longitude': 2.349014},
    # {'name': 'Karachi', 'latitude': 24.9, 'longitude': 67.0},
    # {'name': 'Sydney', 'latitude': -33.9, 'longitude': 151.2},
    # {'name': 'Busan', 'latitude': 35.1, 'longitude': 129.1},
    {'name': 'Dhaka', 'latitude': 23.8, 'longitude': 90.4},
]


def extract_value(data_array, city):
    return data_array.sel(indexers={'latitude': city["latitude"], 'longitude': city["longitude"]}, method='nearest').values


def extract(file: str):
    dataSet = xr.open_dataset(file, decode_times=False, engine='cfgrib', backend_kwargs={'indexpath':''})
    da_pm10 = dataSet['pm10']
    da_pm2_5 = dataSet['pm2p5']
    da_ozone = dataSet['gtco3']
    da_no2 = dataSet['tcno2']
    da_so2 = dataSet['tcso2']

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

