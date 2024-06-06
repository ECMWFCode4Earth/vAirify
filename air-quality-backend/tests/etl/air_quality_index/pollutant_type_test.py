import pytest, unittest
from air_quality.etl.air_quality_index.pollutant_type import (
    PollutantType,
    is_single_level,
    get_molecular_weight,
    pollutants_with_molecular_weight
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
        (PollutantType.PARTICULATE_MATTER_10, True),
        (PollutantType.PARTICULATE_MATTER_2_5, True),
        (PollutantType.NITROGEN_DIOXIDE, False),
        (PollutantType.OZONE, False),
        (PollutantType.SULPHUR_DIOXIDE, False),
    ],
)
def test_is_single_level(pollutant_type: PollutantType, expected: bool):
    assert is_single_level(pollutant_type) == expected


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
def test_get_molecular_weight_valid(pollutant_type: PollutantType):
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
