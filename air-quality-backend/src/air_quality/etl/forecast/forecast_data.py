import datetime
from decimal import Decimal
import logging
import xarray as xr
from air_quality.database.locations import AirQualityLocation
from air_quality.aqi.pollutant_type import (
    PollutantType,
    is_single_level,
)


def convert_east_only_longitude_to_east_west(longitude_value: float) -> float:
    """
    Convert longitude value from range of 0 - 360 to -180 - 180
    """
    if 180 < longitude_value <= 360:
        return float(Decimal(str(longitude_value)) - Decimal("360"))
    return longitude_value


def convert_mmr_to_mass_concentration(
    single_level_data: xr.Dataset, multi_level_data: xr.Dataset
):
    # convert the mass mixing ratios to mass concentrations
    # get pressure on model level 137 from surface pressure
    # https://confluence.ecmwf.int/display/CKB/ERA5%3A+compute+pressure+and+geopotential
    # +on+model+levels%2C+geopotential+height+and+geometric+height
    p_half_above = 0 + 0.997630 * single_level_data["sp"]
    p_half_below = 0 + 1.0 * single_level_data["sp"]
    p_ml = (p_half_above + p_half_below) / 2
    # surface density: rho = p_ml / (R * T)
    rho = p_ml / (287.0 * multi_level_data["t"])
    for result in [single_level_data, multi_level_data]:
        for variable in result.variables:
            if result[variable].attrs.get("units") == "kg kg**-1":
                result[variable] *= rho
                result[variable].attrs["units"] = "kg m**-3"
                logging.debug(
                    f"Updated: {variable}, from units: 'kg kg**-1' to 'kg m**-3'."
                )

    return single_level_data, multi_level_data


def convert_longitude(dataset: xr.Dataset) -> xr.Dataset:
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


pollutant_data_map = {
    PollutantType.OZONE: "go3",
    PollutantType.NITROGEN_DIOXIDE: "no2",
    PollutantType.SULPHUR_DIOXIDE: "so2",
    PollutantType.PARTICULATE_MATTER_10: "pm10",
    PollutantType.PARTICULATE_MATTER_2_5: "pm2p5",
}


class ForecastData:
    def __init__(self, single_level_data: xr.Dataset, multi_level_data: xr.Dataset):
        single, multi = convert_mmr_to_mass_concentration(
            single_level_data, multi_level_data
        )
        self._single_level_data = convert_longitude(single)
        self._multi_level_data = convert_longitude(multi)
        # Eager load datasets for quicker access
        self._single_level_data.load()
        self._multi_level_data.load()

    _cached_pressure = None
    _cached_temperature = None

    def _get_data_set(self, pollutant_type: PollutantType) -> xr.Dataset:
        if is_single_level(pollutant_type):
            return self._single_level_data
        else:
            return self._multi_level_data

    def get_pollutant_data_for_locations(
        self, locations: list[AirQualityLocation], pollutant_types: list[PollutantType]
    ) -> list[tuple[AirQualityLocation, dict[PollutantType : list[float]]]]:
        """
        Get forecasted air pollutant values for given locations
        and pollutants using bilinear interpolation
        :param locations:
        :param pollutant_types:
        :return: values for pollutant at lat/long
        """
        latitudes = []
        longitudes = []
        for location in locations:
            latitudes.append(location["latitude"])
            longitudes.append(location["longitude"])

        interpolated_data_by_pollutant_type = {}
        for pollutant_type in pollutant_types:
            dataset = self._get_data_set(pollutant_type)
            # Interpolation is called n times, where n = len(pollutant_types),
            # irrespective of len(locations)
            interpolated_data = dataset[pollutant_data_map[pollutant_type]].interp(
                latitude=xr.DataArray(latitudes, dims="points"),
                longitude=xr.DataArray(longitudes, dims="points"),
                method="linear",
            )
            interpolated_data_by_pollutant_type[pollutant_type] = interpolated_data

        location_pollutant_tuples = []
        for i, location in enumerate(locations):
            location_pollutant_data = {}
            for (
                pollutant_type,
                interpolated_data,
            ) in interpolated_data_by_pollutant_type.items():
                pollutant_forecast_values = interpolated_data.isel(points=i)
                location_pollutant_data[pollutant_type] = (
                    pollutant_forecast_values.values.tolist()
                )
            location_pollutant_tuples.append((location, location_pollutant_data))
        return location_pollutant_tuples

    def get_step_values(self):
        return self._single_level_data["step"].values

    def get_valid_time_values(self):
        return self._single_level_data["valid_time"].values

    def get_time_value(self) -> int:
        return int(self._single_level_data["time"].values)

    def get_surface_pressure(
        self, longitude: float, latitude: float, forecast_datetime: datetime
    ):
        if self._cached_pressure is None:
            single_pres = self._single_level_data["sp"]
            self._cached_pressure = single_pres.set_index(step=["valid_time"])

        since_epoch = forecast_datetime.timestamp()

        single_point = self._cached_pressure.sel(
            longitude=longitude, latitude=latitude, step=since_epoch, method="nearest"
        )
        return single_point.item()

    def get_temperature(
        self, longitude: float, latitude: float, forecast_datetime: datetime
    ):
        if self._cached_temperature is None:
            multi_temp = self._multi_level_data["t"]
            self._cached_temperature = multi_temp.set_index(step=["valid_time"])

        since_epoch = forecast_datetime.timestamp()

        multi_point = self._cached_temperature.sel(
            longitude=longitude, latitude=latitude, step=since_epoch, method="nearest"
        )
        return multi_point.item()
