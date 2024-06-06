import pprint

import xarray as xr
from system_tests.utils.cams_utilities import get_raw_cams_data


def release_the_gribbler():
    file_path = "single_level_2024-06-04_00.grib"
    ds = xr.open_dataset(file_path, engine="cfgrib")
    selection = ds.sel(indexers={
        "step": "0",
        "latitude": 0,
        "longitude": 0,
    },
        method="nearest")

    pm2_5_raw = "pm2p5"
    data = ds[pm2_5_raw]

    pprint.pprint(selection[pm2_5_raw].values[0])


if __name__ == "__main__":
    release_the_gribbler()
