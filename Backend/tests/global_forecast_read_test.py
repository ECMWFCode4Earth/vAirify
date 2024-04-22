import numpy as np
import pandas as pd
import xarray
from src.cams.global_forecast_read import extract_value


def test_answer():
    dataset = xarray.DataArray(
        data=np.array([[[123]]]),
        dims=['time', 'latitude', 'longitude'],
        coords=dict(
            time=pd.date_range("2014-09-06", periods=1),
            latitude=([51.509865]),
            longitude=([-0.118092]),
        )
    )
    city = {'name': 'London', 'latitude': 51.509865, 'longitude': -0.118092}
    assert extract_value(dataset, city) == [123]
