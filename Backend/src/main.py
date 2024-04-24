import os

from cams.global_forecast_fetch import fetch_forecast_data
from cams.global_forecast_read import extract
from cities import cities
from database.database import insert_data_forecast
from insitu.openaq_forecast_fetch import fetch_insitu_measurements

file_name = 'forecast_data.grib'


if not os.path.isfile(file_name):
    fetch_forecast_data(file_name)

insert_data_forecast(extract(file_name, cities))

print(fetch_insitu_measurements(cities))
