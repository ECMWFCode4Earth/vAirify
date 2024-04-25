from cams.global_forecast_fetch import fetch_forecast_data
from cams.global_forecast_read import transform
from cities import cities
from database.database import insert_data_forecast
from insitu.openaq_forecast_fetch import fetch_insitu_measurements

extracted_forecast_data = fetch_forecast_data()
transformed_forecast_data = transform(extracted_forecast_data, cities)
insert_data_forecast(transformed_forecast_data)

print(fetch_insitu_measurements(cities))
