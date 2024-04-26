from src.etl.forecast.forecast_adapter import ForecastData, find_value_for_city, transform
from .test_data import pm10, extract_result, testCities, single_level_data_set, multi_level_data_set


def test_find_value_for_city():
    assert (find_value_for_city(pm10, testCities[0]) == [0.000000140, 0.0000001]).all()


def test_transform_returns_formatted_data():
    input_data = ForecastData(single_level_data_set, multi_level_data_set)
    assert transform(input_data, testCities) == extract_result
