import os

from cams.global_forecast_fetch import fetch_forecast_data
from cams.global_forecast_read import extract
from cities import cities
from insitu.openaq_forecast_fetch import fetch_insitu_measurements

file_name = 'forecast_data.grib'

if not os.path.isfile("forecast_data.grib"):
    fetch_forecast_data(file_name)

print('5 day forecast values')
extract(f'./{file_name}', cities)

print(fetch_insitu_measurements(cities))
