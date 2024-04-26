from src.cams.forecast_dao import ForecastData
from src.cams.forecast_adapter import find_value_for_city, transform
from tests.global_forecast_read_test_data import pm10, extract_result, testCities, single_level_data_set, multi_level_data_set


def test_find_value_for_city():
    assert (find_value_for_city(pm10, testCities[0]) == [0.000000140, 0.0000001]).all()


def test_transform_returns_formatted_data():
    input_data = ForecastData(single_level_data_set, multi_level_data_set)
    assert transform(input_data, testCities) == extract_result
