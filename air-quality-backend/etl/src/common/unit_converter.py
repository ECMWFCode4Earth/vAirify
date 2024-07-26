from shared.src.aqi.pollutant_type import (
    PollutantType,
    get_molecular_weight,
)


ONE_ATMOSPHERE_IN_HPA = 1013
ZERO_CENTIGRADE_IN_KELVIN = 273
VOLUME_OF_AN_IDEAL_GAS_AT_STP = 22.41


def convert_ppm_to_mgm3(
    ppm_value: float,
    pollutant_type: PollutantType,
    surface_pressure_pa: float,
    temperature_k: float,
):
    ppb = ppm_value * 1000
    surface_pressure_hpa = surface_pressure_pa / 100

    molecular_weight = get_molecular_weight(pollutant_type)
    molecular_volume = (
        VOLUME_OF_AN_IDEAL_GAS_AT_STP
        * (temperature_k / ZERO_CENTIGRADE_IN_KELVIN)
        * (ONE_ATMOSPHERE_IN_HPA / surface_pressure_hpa)
    )

    mgm3 = ppb * (molecular_weight / molecular_volume)

    return mgm3
