from decimal import Decimal
import logging
from enum import Enum

import xarray as xr
from air_quality.database.locations import AirQualityLocation
from air_quality.aqi.pollutant_type import PollutantType
from air_quality.database.in_situ import InSituMeasurement


class ForecastDataType(Enum):
    NITROGEN_DIOXIDE = "no2"
    OZONE = "go3"
    PARTICULATE_MATTER_2_5 = "pm2p5"
    PARTICULATE_MATTER_10 = "pm10"
    SULPHUR_DIOXIDE = "so2"
    SURFACE_PRESSURE = "sp"
    TEMPERATURE = "t"


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
    converted_data["longitude"].attrs["units"] = "degrees_east"
    return converted_data


def is_single_level(forecast_data_type: ForecastDataType) -> bool:
    is_pm2_5 = forecast_data_type == ForecastDataType.PARTICULATE_MATTER_2_5
    is_pm10 = forecast_data_type == ForecastDataType.PARTICULATE_MATTER_10
    is_pressure = forecast_data_type == ForecastDataType.SURFACE_PRESSURE
    return is_pm10 or is_pm2_5 or is_pressure


def convert_to_forecast_data_type(pollutant_type: PollutantType) -> ForecastDataType:
    match pollutant_type:
        case PollutantType.OZONE:
            return ForecastDataType.OZONE
        case PollutantType.SULPHUR_DIOXIDE:
            return ForecastDataType.SULPHUR_DIOXIDE
        case PollutantType.NITROGEN_DIOXIDE:
            return ForecastDataType.NITROGEN_DIOXIDE
        case PollutantType.PARTICULATE_MATTER_2_5:
            return ForecastDataType.PARTICULATE_MATTER_2_5
        case PollutantType.PARTICULATE_MATTER_10:
            return ForecastDataType.PARTICULATE_MATTER_10
        case _:
            raise (
                ValueError(
                    f"Unable to convert pollutant to forecast data type "
                    f"'{pollutant_type}'"
                )
            )


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

    def _get_data_set(self, forecast_data_type: ForecastDataType) -> xr.Dataset:
        if is_single_level(forecast_data_type):
            return self._single_level_data
        else:
            return self._multi_level_data

    def enrich_in_situ_measurements(
        self,
        in_situ_measurements: list[InSituMeasurement],
        required_data: list[ForecastDataType],
    ) -> list[tuple[InSituMeasurement, dict[ForecastDataType:float]]]:
        if len(in_situ_measurements) == 0:
            return []

        latitudes = []
        longitudes = []
        valid_times = []
        for in_situ_measurement in in_situ_measurements:
            longitude = in_situ_measurement["location"]["coordinates"][0]
            latitude = in_situ_measurement["location"]["coordinates"][1]
            valid_time = in_situ_measurement["measurement_date"].timestamp()

            if latitude not in latitudes:
                latitudes.append(latitude)
            if longitude not in longitudes:
                longitudes.append(longitude)
            if valid_time not in valid_times:
                valid_times.append(valid_time)

        interpolated_data_by_data_type = {}
        for required_datum in required_data:
            dataset = self._get_data_set(required_datum).swap_dims(
                {"step": "valid_time"}
            )

            interpolated_data = dataset[required_datum.value].interp(
                latitude=xr.DataArray(latitudes, dims="latitude"),
                longitude=xr.DataArray(longitudes, dims="longitude"),
                valid_time=xr.DataArray(valid_times, dims="valid_time"),
                method="linear",
            )
            (
                interpolated_data.set_index(valid_time=["valid_time"])
                .set_index(latitude=["latitude"])
                .set_index(longitude=["longitude"])
            )

            interpolated_data_by_data_type[required_datum] = interpolated_data

        forecast_tuples = []
        for in_situ_measurement in in_situ_measurements:
            valid_time = in_situ_measurement["measurement_date"].timestamp()
            longitude = in_situ_measurement["location"]["coordinates"][0]
            latitude = in_situ_measurement["location"]["coordinates"][1]
            forecast_data = {}

            for (
                forecast_data_type,
                interpolated_data,
            ) in interpolated_data_by_data_type.items():
                forecast_value = interpolated_data.sel(
                    valid_time=valid_time, longitude=longitude, latitude=latitude
                ).item()
                forecast_data[forecast_data_type] = forecast_value
            forecast_tuples.append((in_situ_measurement, forecast_data))
        return forecast_tuples

    def get_pollutant_data_for_locations(
        self, locations: list[AirQualityLocation], pollutant_types: list[PollutantType]
    ) -> list[tuple[AirQualityLocation, dict[PollutantType : list[float]]]]:
        """
        Get forecasted air pollutant values for given locations
        and pollutants using bi-linear interpolation
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
            forecast_data_type = convert_to_forecast_data_type(pollutant_type)
            dataset = self._get_data_set(forecast_data_type)
            # Interpolation is called n times, where n = len(pollutant_types),
            # irrespective of len(locations)
            interpolated_data = dataset[forecast_data_type.value].interp(
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
