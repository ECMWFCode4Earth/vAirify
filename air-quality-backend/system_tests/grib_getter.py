import pprint

import numpy as np
import xarray as xr
import scipy.interpolate
from scipy.interpolate import interp2d
from system_tests.utils.cams_utilities import get_raw_cams_data


def release_the_gribbler():
    file_path = "single_level_2024-06-04_00.grib"
    ds = xr.open_dataset(file_path, engine="cfgrib")
    selection = ds.sel(indexers={
        "step": "0",
        "latitude": 26
        ,  # Ranging from -90 to 90
        "longitude": (55 + 180)
        ,  # CAMS has 0-360 at this point. incrementing in 0.4
    },
        method="nearest")
    pm2_5_raw = "pm2p5"
    data = ds[pm2_5_raw]
    pm2_5_value = selection[pm2_5_raw].values.item()

    pprint.pprint(pm2_5_value * 10 ** 9)


def epic_interpolation():
    file_path = "single_level_2024-06-04_00.grib"
    ds = xr.open_dataset(file_path, engine="cfgrib")

    # Extract the relevant data
    latitudes = ds['latitude'].values
    longitudes = ds['longitude'].values
    pm2_5_data = ds['pm2p5'].isel(step=0).values

    target_lat = 25.0657
    target_lon = 55.17128

    # data set 0 - 360 convert
    if target_lon < 0:
        target_lon += 360

    interpolator = scipy.interpolate.interp2d(longitudes, latitudes, pm2_5_data, kind='linear')
    pm2_5_value = interpolator(target_lon, target_lat)

    pprint.pprint(pm2_5_value[0] * 10 ** 9)


if __name__ == "__main__":
    release_the_gribbler()
    epic_interpolation()
