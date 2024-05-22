import sys
sys.path.append("../")
from dotenv import load_dotenv
import xarray as xr

import time
from src.database.air_quality_dashboard_dao import (
    get_locations_by_type
)
from src.etl.forecast.forecast_dao import fetch_forecast_data
from src.etl.forecast.forecast_adapter import transform
from src.etl.air_quality_index.pollutant_type import PollutantType

from concurrent.futures import ThreadPoolExecutor

load_dotenv()
cities = get_locations_by_type("city")
# cities = cities[:5]

####################################################################################################
# define serial city lookup (current default)
def get_single_city(forecast_data, city, PollutantType):
    results = {city['name']: {}} 
    for pollutant_type in PollutantType:
        dataset = forecast_data._get_data_set(pollutant_type)
        interpolated_data = dataset[pollutant_type.value].interp(
            latitude=city["latitude"],
            longitude=city["longitude"],
            method="linear",
        )
        results[city['name']][pollutant_type.name] = interpolated_data.values.tolist()
    return results


def transform_loop(forecast_data, cities, PollutantType):
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(get_single_city, forecast_data, city, PollutantType) for city in cities
        ]
        results = {}
        for future in futures:
            results.update(future.result())
    return results
   
####################################################################################################
# parallel interpolation with xarray 
def transform_parallel(forecast_data, cities, PollutantType):
    latitudes = [city["latitude"] for city in cities]
    longitudes = [city["longitude"] for city in cities]
    
    target_lats = xr.DataArray(latitudes, dims="points")
    target_lons = xr.DataArray(longitudes, dims="points")
    
    results = {city["name"]: {ptype.name: [] for ptype in PollutantType} for city in cities}
    
    for pollutant_type in PollutantType:
        dataset = forecast_data._get_data_set(pollutant_type)
        interpolated_data = dataset[pollutant_type.value].interp(
            latitude=target_lats,
            longitude=target_lons,
            method="linear",
        )
        pollutant_forecast_values = interpolated_data.values.tolist()
        
        for i, city in enumerate(cities):
            pollutant_forecast_values = interpolated_data.isel(points=i).values.tolist()
            results[city["name"]][pollutant_type.name].extend(pollutant_forecast_values)

    return results

print("Fetching forecast data")
extracted_forecast_data = fetch_forecast_data()

print("Transforming forecast data via loop")
start_time = time.time()
results_loop = transform_loop(extracted_forecast_data, cities, PollutantType)
end_time = time.time()
execution_time = end_time - start_time
print(f"Execution time for loop: {execution_time} seconds")

print("Transforming forecast data via parallel xarray.interp()")
start_time = time.time()
results_parallel = transform_parallel(extracted_forecast_data, cities, PollutantType)
end_time = time.time()
execution_time = end_time - start_time
print(f"Execution time for parallel transformation: {execution_time} seconds")


def compare_results(results_loop, results_parallel, city):
    city_results_loop = results_loop.get(city, {})
    city_results_parallel = results_parallel.get(city, {})

    if not city_results_loop or not city_results_parallel:
        return f"Results for {city} are missing in one of the methods."

    all_pollutants_match = True
    for pollutant in city_results_loop:
        loop_values = city_results_loop[pollutant]
        parallel_values = city_results_parallel[pollutant]
        
        if len(loop_values) != len(parallel_values):
            print(f"Data length mismatch for {pollutant}")
            all_pollutants_match = False
            continue

        # check each value to be approximately equal
        for lv, pv in zip(loop_values, parallel_values):
            if not isclose(lv, pv, rel_tol=1e-4): 
                print(f"Mismatch found in {pollutant}: Loop value {lv} vs Parallel value {pv}")
                all_pollutants_match = False
                break
        else:
            print(f"Values for {pollutant} are consistent across both methods.")

    if all_pollutants_match:
        return f"All pollutant data for {city} match across both methods."
    else:
        return "There are discrepancies in the pollutant data for {city} between the two methods."

from math import isclose

result_message = compare_results(results_loop, results_parallel, "London")
print(result_message)