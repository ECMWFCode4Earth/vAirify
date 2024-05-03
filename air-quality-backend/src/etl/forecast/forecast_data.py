import xarray as xr
from src.etl.air_quality_index.pollutant_type import PollutantType, is_single_level


class ForecastData:
    def __init__(self, single_level_data: xr.Dataset, multi_level_data: xr.Dataset):
        self.single_level_data = single_level_data
        self.multi_level_data = multi_level_data

    def get_data(self, pollutant_type: PollutantType) -> xr.DataArray:
        if is_single_level(pollutant_type):
            return self.single_level_data[pollutant_type.value]
        else:
            return self.multi_level_data[pollutant_type.value]

    def get_step_values(self):
        return self.single_level_data["step"].values

    def get_time_value(self) -> int:
        return int(self.single_level_data["time"].values)
