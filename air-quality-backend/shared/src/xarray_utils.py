import xarray as xr
from typing import Tuple, Optional

def _get_dimension_by_attr(
    dataset: xr.Dataset, attr_name: str, attr_value: str
) -> Optional[xr.DataArray]:
    """
    Find the dimension by attribute name and value.

    :param dataset: The dataset to search.
    :param attr_name: The attribute name to search for.
    :param attr_value: The attribute value to match.

    :return: The matching DataArray if found, otherwise None.
    """
    for var in dataset.variables.values():
        if attr_name in var.attrs and var.attrs[attr_name] == attr_value:
            return var
    return None


def get_dim_names(
    dataset: xr.Dataset,
) -> Tuple[Optional[xr.DataArray], Optional[xr.DataArray], Optional[xr.DataArray]]:
    """
    Get the latitude, longitude, and time dimensions from the dataset.

    :param dataset: The dataset to search.

    :return: A tuple containing (latitude, longitude, time) DataArrays.
    """
    lat = _get_dimension_by_attr(dataset, "units", "degrees_north")
    lon = _get_dimension_by_attr(dataset, "units", "degrees_east")
    time = _get_dimension_by_attr(dataset, "standard_name", "time")
    return lat, lon, time