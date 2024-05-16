import pytest
from src.etl.air_quality_index.pollutant_type import PollutantType, is_single_level


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
