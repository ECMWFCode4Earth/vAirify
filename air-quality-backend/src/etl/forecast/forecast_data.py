from decimal import Decimal
import xarray as xr
from src.etl.air_quality_index.pollutant_type import PollutantType, is_single_level


def convert_east_only_longitude_to_east_west(longitude_value: float) -> float:
    """
    Convert longitude value from range of 0 - 360 to -180 - 180
    """
    if 180 < longitude_value <= 360:
        return float(Decimal(str(longitude_value)) - Decimal("360"))
    return longitude_value


def convert_kg_to_ug(x: float):
    return float(Decimal(str(x)) * Decimal(10**9))


def convert_dataset(dataset: xr.Dataset) -> xr.Dataset:
    converted_data = dataset.assign_coords(
        longitude=list(
            map(
                lambda lon: convert_east_only_longitude_to_east_west(
                    lon.values.flat[0]
                ),
                dataset.longitude,
            )
        )
    )
    converted_data = converted_data.sortby("longitude")
    return converted_data


class ForecastData:
    def __init__(self, single_level_data: xr.Dataset, multi_level_data: xr.Dataset):
        self._single_level_data = convert_dataset(single_level_data)
        self._multi_level_data = convert_dataset(multi_level_data)
        # Eager load datasets for quicker access
        self._single_level_data.load()
        self._multi_level_data.load()

    def _get_data_set(self, pollutant_type: PollutantType) -> xr.Dataset:
        if is_single_level(pollutant_type):
            return self._single_level_data
        else:
            return self._multi_level_data

    def get_pollutant_data_for_lat_long(
        self, latitude: float, longitude: float, pollutant_type: PollutantType
    ) -> list[float]:
        """
        Get forecasted air pollutant values (kgm3) for a given lat/long
        and pollutant using bilinear interpolation
        :param latitude:
        :param longitude:
        :param pollutant_type:
        :return: values for pollutant at lat/long
        """
        dataset = self._get_data_set(pollutant_type)
        return dataset.interp(
            latitude=latitude,
            longitude=longitude,
            method="linear",
        )[pollutant_type.value].values.tolist()

    def get_step_values(self):
        return self._single_level_data["step"].values

    def get_valid_time_values(self):
        return self._single_level_data["valid_time"].values

    def get_time_value(self) -> int:
        return int(self._single_level_data["time"].values)
