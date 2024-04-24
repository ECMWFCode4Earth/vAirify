import xarray

from src.cams.global_forecast_read import extract_value, extract
from tests.global_forecast_read_test_data import pm10, extract_result, testCities, data_set


def test_extractValue_dataArray_returnsFormattedData():
    assert (extract_value(pm10, testCities[0]) == [140, 100]).all()


def test_extract_dataSet_returnsFormattedData(mocker):
    mocker.patch.object(xarray, 'open_dataset')
    mocker.patch.object(xarray.open_dataset.return_value, 'close')
    xarray.open_dataset.return_value = data_set

    assert extract("file", testCities) == extract_result
