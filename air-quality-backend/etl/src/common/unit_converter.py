from shared.src.aqi.pollutant_type import (
    PollutantType,
    get_molecular_weight,
)


def convert_ppm_to_mgm3(
    ppm_value: float,
    pollutant_type: PollutantType,
    surface_pressure_pa: float,
    temperature_k: float,
):
    ppb = ppm_value * 1000
    surface_pressure_hpa = surface_pressure_pa / 100

    molecular_weight = get_molecular_weight(pollutant_type)
    molecular_volume = 22.41 * (temperature_k / 273) * (1013 / surface_pressure_hpa)

    mgm3 = ppb * (molecular_weight / molecular_volume)

    return mgm3
