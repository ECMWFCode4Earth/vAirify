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


def get_overall_aqi_level(aqi_values: list[int]) -> int:
    return max(aqi_values)
