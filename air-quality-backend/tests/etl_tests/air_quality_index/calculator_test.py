import pytest
from etl.air_quality_index.pollutant_type import PollutantType
from etl.air_quality_index.calculator import (
    get_overall_aqi_level,
    get_pollutant_index_level,
)


@pytest.mark.parametrize(
    "values, pollutant_type, expected",
    [
        (
            [0, 25, 49.99999999999999, 50],
            PollutantType.OZONE,
            1,
        ),
        (
            [50.00000000000001, 75, 99.99999999999999, 100],
            PollutantType.OZONE,
            2,
        ),
        (
            [100.0000000000001, 115, 129.9999999999999, 130],
            PollutantType.OZONE,
            3,
        ),
        (
            [130.0000000000001, 168, 239.9999999999999, 240],
            PollutantType.OZONE,
            4,
        ),
        (
            [240.0000000000001, 300, 379.9999999999999, 380],
            PollutantType.OZONE,
            5,
        ),
        (
            [380.0000000000001, 500, 800, 6000],
            PollutantType.OZONE,
            6,
        ),
        (
            [0, 20, 39.9999999999999999, 40],
            PollutantType.NITROGEN_DIOXIDE,
            1,
        ),
        (
            [40.00000000000001, 60, 89.99999999999999, 90],
            PollutantType.NITROGEN_DIOXIDE,
            2,
        ),
        (
            [90.00000000000001, 100, 119.99999999999999, 120],
            PollutantType.NITROGEN_DIOXIDE,
            3,
        ),
        (
            [120.00000000000001, 175, 229.99999999999999, 230],
            PollutantType.NITROGEN_DIOXIDE,
            4,
        ),
        (
            [230.0000000000001, 285, 339.99999999999999, 340],
            PollutantType.NITROGEN_DIOXIDE,
            5,
        ),
        (
            [340.0000000000001, 600, 999.99999999999999, 1000, 3000],
            PollutantType.NITROGEN_DIOXIDE,
            6,
        ),
        (
            [0, 50, 99.99999999999999, 100],
            PollutantType.SULPHUR_DIOXIDE,
            1,
        ),
        (
            [100.00000000000001, 150, 199.99999999999999, 200],
            PollutantType.SULPHUR_DIOXIDE,
            2,
        ),
        (
            [200.0000000000001, 290, 349.9999999999999, 350],
            PollutantType.SULPHUR_DIOXIDE,
            3,
        ),
        (
            [350.0000000000001, 400, 499.9999999999999, 500],
            PollutantType.SULPHUR_DIOXIDE,
            4,
        ),
        (
            [500.0000000000001, 600, 749.9999999999999, 750],
            PollutantType.SULPHUR_DIOXIDE,
            5,
        ),
        (
            [750.0000000000001, 4000],
            PollutantType.SULPHUR_DIOXIDE,
            6,
        ),
        (
            [0, 10, 19.99999999999999, 20],
            PollutantType.PARTICULATE_MATTER_10,
            1,
        ),
        (
            [20.00000000000001, 30, 39.999999999999999, 40],
            PollutantType.PARTICULATE_MATTER_10,
            2,
        ),
        (
            [40.00000000000001, 45, 49.99999999999999, 50],
            PollutantType.PARTICULATE_MATTER_10,
            3,
        ),
        (
            [50.00000000000001, 75, 99.99999999999999, 100],
            PollutantType.PARTICULATE_MATTER_10,
            4,
        ),
        (
            [100.0000000000001, 125, 149.9999999999999, 150],
            PollutantType.PARTICULATE_MATTER_10,
            5,
        ),
        (
            [150.0000000000001, 500],
            PollutantType.PARTICULATE_MATTER_10,
            6,
        ),
        (
            [0, 5, 9.999999999999999, 10],
            PollutantType.PARTICULATE_MATTER_2_5,
            1,
        ),
        (
            [10.00000000000001, 15, 19.99999999999999, 20],
            PollutantType.PARTICULATE_MATTER_2_5,
            2,
        ),
        (
            [20.00000000000001, 22.5, 24.99999999999999, 25],
            PollutantType.PARTICULATE_MATTER_2_5,
            3,
        ),
        (
            [25.00000000000001, 37.5, 49.99999999999999, 50],
            PollutantType.PARTICULATE_MATTER_2_5,
            4,
        ),
        (
            [50.00000000000001, 67.5, 74.99999999999999, 75],
            PollutantType.PARTICULATE_MATTER_2_5,
            5,
        ),
        (
            [75.00000000000001, 800, 6000],
            PollutantType.PARTICULATE_MATTER_2_5,
            6,
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
