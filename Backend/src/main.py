from src.cams.global_forecast_fetch import fetch_forecast_data
from src.cams.global_forecast_read import extract

file_name = 'forecast_data.grib'
fetch_forecast_data(file_name)

print('5 day forecast values')
extract(f'./{file_name}')
