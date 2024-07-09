from unittest.mock import patch
import pytest

from shared.src.aqi.pollutant_type import PollutantType
from etl.src.common.unit_converter import convert_ppm_to_mgm3


@patch("etl.src.common.unit_converter.get_molecular_weight")
@pytest.mark.parametrize(
    "ppm_value, molecular_weight, pressure_pa, temperature_k, expected",
    [
        (0.001, 22.41, 101300, 273, 1),  # base numbers
        (0.002, 22.41, 101300, 273, 2),  # ppm goes up, mgm3 goes up
        (0.001, 44.82, 101300, 273, 2),  # m_w goes up, mgm3 goes up
        (0.001, 22.41, 10130, 273, 0.1),  # pressure drops, mgm3 goes down
        (0.001, 22.41, 101300, 341.25, 0.8),  # temp goes up, mgm3 goes down
        (0.022, 46.01, 101987.0390625, 283.8622741699219, 43.734439475632435),
    ],
)
def test__convert_ppm_to_mgm3__returns_converted_values(
    get_molecular_weight_mock,
    ppm_value,
    molecular_weight,
    pressure_pa,
    temperature_k,
    expected,
):

    get_molecular_weight_mock.return_value = molecular_weight
    # irrelevant as we're mocking the molecular weight
    pollutant_to_convert = PollutantType.SULPHUR_DIOXIDE

    result = convert_ppm_to_mgm3(
        ppm_value, pollutant_to_convert, pressure_pa, temperature_k
    )

    get_molecular_weight_mock.assert_called_with(pollutant_to_convert)
    assert result == expected
