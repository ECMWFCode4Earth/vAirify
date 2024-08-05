from .pollutant_type import PollutantType

_aqi_ranges_by_pollutant = {
    PollutantType.OZONE: [
        (1, 50),
        (2, 100),
        (3, 130),
        (4, 240),
        (5, 380),
        (6, 800),
    ],
    PollutantType.NITROGEN_DIOXIDE: [
        (1, 40),
        (2, 90),
        (3, 120),
        (4, 230),
        (5, 340),
        (6, 1000),
    ],
    PollutantType.SULPHUR_DIOXIDE: [
        (1, 100),
        (2, 200),
        (3, 350),
        (4, 500),
        (5, 750),
        (6, 1250),
    ],
    PollutantType.PARTICULATE_MATTER_10: [
        (1, 20),
        (2, 40),
        (3, 50),
        (4, 100),
        (5, 150),
        (6, 1200),
    ],
    PollutantType.PARTICULATE_MATTER_2_5: [
        (1, 10),
        (2, 20),
        (3, 25),
        (4, 50),
        (5, 75),
        (6, 800),
    ],
}


def get_pollutant_index_level(value: float, pollutant_type: PollutantType) -> int:
    ranges = _aqi_ranges_by_pollutant[pollutant_type]
    for aqi_level, max_value in ranges:
        if value <= max_value:
            return aqi_level
    return ranges.__len__()


def get_pollutant_fractional_index_level(
    value: float, pollutant_type: PollutantType
) -> float:
    ranges = _aqi_ranges_by_pollutant[pollutant_type]

    # value below the first breakpoint
    if value <= ranges[0][1]:
        lower_level, lower_max = ranges[0]
        return 1.0 + lower_level * (value / lower_max)

    # value above the last breakpoint
    if value > ranges[-1][1]:
        return 7.0

    # interpolate between breakpoints
    for i in range(len(ranges) - 1):
        lower_level, lower_max = ranges[i]
        upper_level, upper_max = ranges[i + 1]

        if lower_max < value <= upper_max:
            return (
                1.0
                + lower_level
                + (upper_level - lower_level)
                * (value - lower_max)
                / (upper_max - lower_max)
            )

    # default return value (should not be reached)
    return 9999.0


def get_overall_aqi_level(aqi_values: list[int]) -> int:
    return max(aqi_values)
