from datetime import datetime

from dotenv import load_dotenv
from database.air_quality_dashboard_dao import insert_data_forecast, insert_data_openaq
from forecast.forecast_dao import fetch_forecast_data
from forecast.forecast_adapter import transform
from in_situ.openaq_dao import fetch_in_situ_measurements
from in_situ.openaq_adapter import transform_in_situ_data

cities = [
    {"name": "Dublin", "latitude": 53.350140, "longitude": -6.266155},
    {"name": "London", "latitude": 51.509865, "longitude": -0.118092},
    {"name": "Paris", "latitude": 48.864716, "longitude": 2.349014},
    {"name": "Karachi", "latitude": 24.9, "longitude": 67.0},
    {"name": "Sydney", "latitude": -33.9, "longitude": 151.2},
    {"name": "Busan", "latitude": 35.1, "longitude": 129.1},
    {"name": "Dhaka", "latitude": 23.8, "longitude": 90.4},
]

load_dotenv()

print("Extracting pollutant forecast data")
extracted_forecast_data = fetch_forecast_data(
    model_base_date=datetime.now().strftime("%Y-%m-%d")
)

print("Transforming forecast data")
transformed_forecast_data = transform(extracted_forecast_data, cities)

print("Persisting forecast data")
insert_data_forecast(transformed_forecast_data)

print("Extracting in situ pollutant data")
retrieved_in_situ_data = fetch_in_situ_measurements(cities)
print(retrieved_in_situ_data)
print("Transforming in situ data")
transformed_in_situ_data = transform_in_situ_data(retrieved_in_situ_data, cities)

print("Persisting in situ data")
insert_data_openaq(transformed_in_situ_data)
