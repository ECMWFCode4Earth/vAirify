from enum import Enum
import xarray as xr


class ForecastDataType(Enum):
    NITROGEN_DIOXIDE = "no2"
    OZONE = "go3"
    PARTICULATE_MATTER_2_5 = "pm2p5"
    PARTICULATE_MATTER_10 = "pm10"
    SULPHUR_DIOXIDE = "so2"

    def __eq__(self, other):
        if other is None or not hasattr(other, "name") or not hasattr(other, "value"):
            return False
        return other.name == self.name and other.value == self.value

    def __hash__(self):
        return hash(self.value)


def is_single_level(forecast_data_type: ForecastDataType) -> bool:
    is_pm2_5 = forecast_data_type == ForecastDataType.PARTICULATE_MATTER_2_5
    is_pm10 = forecast_data_type == ForecastDataType.PARTICULATE_MATTER_10
    return is_pm10 or is_pm2_5


class ForecastData:
    def __init__(self, single_level_data: xr.Dataset, multi_level_data: xr.Dataset):
        self.single_level_data = single_level_data
        self.multi_level_data = multi_level_data

    def get_data(self, forecast_data_type: ForecastDataType) -> xr.DataArray:
        if is_single_level(forecast_data_type):
            return self.single_level_data[forecast_data_type.value]
        else:
            return self.multi_level_data[forecast_data_type.value]

    def get_step_values(self):
        return self.single_level_data["step"].values

    def get_time_value(self) -> int:
        return int(self.single_level_data["time"].values)
