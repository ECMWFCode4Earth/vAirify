import pytest
from shared.src.aqi.pollutant_type import (
    PollutantType,
    get_molecular_weight,
    pollutants_with_molecular_weight,
)


@pytest.mark.parametrize(
    "arg1, arg2, expected",
    [
        (
            PollutantType.PARTICULATE_MATTER_10,
            PollutantType.PARTICULATE_MATTER_10,
            True,
        ),
        (
            PollutantType.PARTICULATE_MATTER_2_5,
            PollutantType.PARTICULATE_MATTER_10,
            False,
        ),
        (PollutantType.PARTICULATE_MATTER_2_5, {}, False),
    ],
)
def test_forecast_data_type_equality(arg1, arg2, expected: bool):
    assert (arg1 == arg2) == expected


@pytest.mark.parametrize(
    "pollutant_type, expected",
    [
        (PollutantType.NITROGEN_DIOXIDE, 46.01),
        (PollutantType.SULPHUR_DIOXIDE, 64.07),
        (PollutantType.OZONE, 48),
    ],
)
def test_get_molecular_weight_valid(pollutant_type: PollutantType, expected: float):
    assert get_molecular_weight(pollutant_type) == expected


@pytest.mark.parametrize(
    "pollutant_type",
    [
        PollutantType.PARTICULATE_MATTER_2_5,
        PollutantType.PARTICULATE_MATTER_10,
    ],
)
def test_get_molecular_weight_invalid(pollutant_type: PollutantType):
    with pytest.raises(ValueError):
        get_molecular_weight(pollutant_type)


def test_pollutants_with_molecular_weight():
    expected = [
        PollutantType.NITROGEN_DIOXIDE,
        PollutantType.SULPHUR_DIOXIDE,
        PollutantType.OZONE,
    ]
    result = pollutants_with_molecular_weight()

    assert expected == result
