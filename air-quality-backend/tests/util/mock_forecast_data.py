from datetime import datetime, timezone

import pandas as pd
import xarray

from air_quality.database.forecasts import Forecast
from tests.util.mock_location import create_test_city

default_steps = [24, 48]
default_latitudes = [-10, 0, 10]
default_longitudes = [0, 10, 350]
default_time = 1713744000
default_valid_time = [default_time + (x * 60 * 60) for x in default_steps]
default_test_cities = [
    create_test_city("Dublin", -10, 0),
    create_test_city("London", 0, 10),
    create_test_city("Paris", 10, -10),
]


def create_test_pollutant_data(
    steps, latitudes, longitudes, values
) -> xarray.DataArray:
    index = pd.MultiIndex.from_product(
        [steps, latitudes, longitudes], names=["step", "latitude", "longitude"]
    )

    series = pd.Series(values, index=index)
    return xarray.DataArray.from_series(series)


def create_test_pollutant_data_with_defaults(values) -> xarray.DataArray:
    return create_test_pollutant_data(
        default_steps, default_latitudes, default_longitudes, values
    )


no2 = create_test_pollutant_data_with_defaults(
    values=[
        0.0000001,
        None,
        None,
        None,
        0.000000125,
        None,
        None,
        None,
        0.00000015,
        0.0000002,
        None,
        None,
        None,
        0.000000225,
        None,
        None,
        None,
        0.00000025,
    ]
)

go3 = create_test_pollutant_data_with_defaults(
    values=[
        0.0000003,
        None,
        None,
        None,
        0.000000325,
        None,
        None,
        None,
        0.00000035,
        0.0000004,
        None,
        None,
        None,
        0.000000425,
        None,
        None,
        None,
        0.00000045,
    ]
)

so2 = create_test_pollutant_data_with_defaults(
    values=[
        0.0000005,
        None,
        None,
        None,
        0.000000525,
        None,
        None,
        None,
        0.00000055,
        0.0000006,
        None,
        None,
        None,
        0.000000625,
        None,
        None,
        None,
        0.00000065,
    ]
)

t = create_test_pollutant_data_with_defaults(
    values=[
        0.0000011,
        None,
        None,
        None,
        0.000001125,
        None,
        None,
        None,
        0.00000115,
        0.0000012,
        None,
        None,
        None,
        0.000001625,
        None,
        None,
        None,
        0.00000125,
    ]
)


pm2p5 = create_test_pollutant_data_with_defaults(
    values=[
        0.0000007,
        None,
        None,
        None,
        0.000000725,
        None,
        None,
        None,
        0.00000075,
        0.0000008,
        None,
        None,
        None,
        0.000000825,
        None,
        None,
        None,
        0.00000085,
    ]
)


pm10 = create_test_pollutant_data_with_defaults(
    values=[
        0.0000009,
        None,
        None,
        None,
        0.000000925,
        None,
        None,
        None,
        0.00000095,
        0.000001,
        None,
        None,
        None,
        0.000001225,
        None,
        None,
        None,
        0.00000125,
    ]
)

sp = create_test_pollutant_data_with_defaults(
    values=[
        0.0000013,  # time: +24, lat : -10, long : 0
        None,
        None,
        None,
        0.000001325,  # time: +24, lat : 0, long : 10
        None,
        None,
        None,
        0.00000135,  # time: +24, lat : 10, long : 350 -> lat : 10, long -10
        0.0000012,  # time: +48, lat : -10, long : 0
        None,
        None,
        None,
        0.000001425,  # time: +48, lat : 0, long : 10
        None,
        None,
        None,
        0.00000145,  # time: +48, lat : 10, long : 350 -> lat : 10, long -10
    ]
)


def get_coordinates():
    return xarray.Coordinates(
        coords={
            "step": default_steps,
            "time": default_time,
            "valid_time": ("step", default_valid_time),
        }
    )


single_level_data_set = xarray.Dataset(
    coords=get_coordinates(),
    data_vars=dict(pm2p5=pm2p5, pm10=pm10, sp=sp),
)

multi_level_data_set = xarray.Dataset(
    coords=get_coordinates(),
    data_vars=dict(no2=no2, go3=go3, so2=so2, t=t),
)


def create_mock_forecast_document(overrides) -> Forecast:
    default_document = {
        "forecast_base_time": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
        "forecast_valid_time": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
        "name": "Abidjan",
        "source": "cams-production",
        "location_type": "city",
        "last_modified_time": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
        "created_time": datetime(2024, 5, 27, 12, 0, tzinfo=timezone.utc),
        "location": {"type": "Point", "coordinates": [90, 90]},
        "forecast_range": 0,
        "overall_aqi_level": 1,
        "o3": {"aqi_level": 1, "value": 1.0},
        "no2": {"aqi_level": 1, "value": 2.0},
        "so2": {"aqi_level": 1, "value": 3.0},
        "pm10": {"aqi_level": 2, "value": 4.0},
        "pm2_5": {"aqi_level": 2, "value": 5.0},
    }
    return {**default_document, **overrides}
