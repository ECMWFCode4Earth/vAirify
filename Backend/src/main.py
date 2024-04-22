from cams.global_forecast_fetch import fetch_forecast_data
from cams.global_forecast_read import extract
import os

cities = [
    {'name': 'Dublin', 'latitude': 53.350140, 'longitude': -6.266155},
    {'name': 'London', 'latitude': 51.509865, 'longitude': -0.118092},
    {'name': 'Paris', 'latitude': 48.864716, 'longitude': 2.349014},
    {'name': 'Dhaka', 'latitude': 23.8, 'longitude': 90.4},
    # {'name': 'Karachi', 'latitude': 24.9, 'longitude': 67.0},
    # {'name': 'Sydney', 'latitude': -33.9, 'longitude': 151.2},
    # {'name': 'Busan', 'latitude': 35.1, 'longitude': 129.1},
]

file_name = 'forecast_data.grib'
if not os.path.isfile(file_name):
    fetch_forecast_data(file_name)

print('5 day forecast values')
extract(f'./{file_name}', cities)
