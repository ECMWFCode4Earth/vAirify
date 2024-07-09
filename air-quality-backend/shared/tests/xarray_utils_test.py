from shared.src.xarray_utils import (
    _get_dimension_by_attr,
    get_dim_names,
)

from shared.tests.util.mock_forecast_data import (
    gridded_data_single_level,
)

def test__get_dimension_by_attr():
    lat = _get_dimension_by_attr(gridded_data_single_level, "units", "degrees_north")
    lon = _get_dimension_by_attr(gridded_data_single_level, "units", "degrees_east")
    time = _get_dimension_by_attr(gridded_data_single_level, "standard_name", "time")
    non_existent = _get_dimension_by_attr(gridded_data_single_level, "units", "non_existent_unit")

    assert lat is not None
    assert lon is not None
    assert time is not None
    assert lat.attrs["units"] == "degrees_north"
    assert lon.attrs["units"] == "degrees_east"
    assert time.attrs["standard_name"] == "time"
    assert non_existent is None

def test__get_dim_names():
    lat, lon, time = get_dim_names(gridded_data_single_level)

    assert lat is not None
    assert lon is not None
    assert time is not None
    assert lat.attrs["units"] == "degrees_north"
    assert lon.attrs["units"] == "degrees_east"
    assert time.attrs["standard_name"] == "time"