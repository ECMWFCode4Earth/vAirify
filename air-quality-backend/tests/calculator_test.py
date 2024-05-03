import pytest
from src.etl.air_quality_index.pollutant_type import PollutantType
from src.etl.air_quality_index.calculator import (
    get_overall_aqi_level,
    get_pollutant_index_level,
)


@pytest.mark.parametrize(
    "values, pollutant_type, expected",
    [
        (
            [0, 50],
            PollutantType.OZONE,
            1,
        ),
        (
            [50.01, 100],
            PollutantType.OZONE,
            2,
        ),
        (
            [100.1, 130],
            PollutantType.OZONE,
            3,
        ),
        (
            [130.1, 240],
            PollutantType.OZONE,
            4,
        ),
        (
            [240.1, 380],
            PollutantType.OZONE,
            5,
        ),
        (
            [380.1, 800],
            PollutantType.OZONE,
            6,
        ),
        (
            [801],
            PollutantType.OZONE,
            6,
        ),
        (
            [0, 40],
            PollutantType.NITROGEN_DIOXIDE,
            1,
        ),
        (
            [749, 749.1, 749.1234567],
            PollutantType.SULPHUR_DIOXIDE,
            5,
        ),
        (
            [0, 20],
            PollutantType.PARTICULATE_MATTER_10,
            1,
        ),
        (
            [21, 22, 23, 24, 25],
            PollutantType.PARTICULATE_MATTER_2_5,
            3,
        ),
    ],
)
def test__get_pollutant_index_level(
    values: list[float], pollutant_type: PollutantType, expected: int
):
    for value in values:
        assert get_pollutant_index_level(value, pollutant_type) == expected


@pytest.mark.parametrize(
    "values, expected",
    [
        (
            [1, 2, 3, 4, 5],
            5,
        ),
        (
            [1, 1, 1, 1, 2],
            2,
        ),
        (
            [5, 5, 6, 5, 5],
            6,
        ),
        (
            [1, 1, 1],
            1,
        ),
    ],
)
def test__get_overall_aqi_level(values: list[int], expected: int):
    assert get_overall_aqi_level(values) == expected
