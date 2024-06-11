from enum import Enum


class PollutantType(Enum):
    NITROGEN_DIOXIDE = "no2"
    OZONE = "o3"
    PARTICULATE_MATTER_2_5 = "pm2_5"
    PARTICULATE_MATTER_10 = "pm10"
    SULPHUR_DIOXIDE = "so2"

    def __eq__(self, other):
        if other is None or not hasattr(other, "name") or not hasattr(other, "value"):
            return False
        return other.name == self.name and other.value == self.value

    def __hash__(self):
        return hash(self.value)


def pollutants_with_molecular_weight():
    return [
        PollutantType.NITROGEN_DIOXIDE,
        PollutantType.SULPHUR_DIOXIDE,
        PollutantType.OZONE,
    ]


def get_molecular_weight(pollutant_type: PollutantType):
    match pollutant_type:
        case PollutantType.NITROGEN_DIOXIDE:
            return 46.01
        case PollutantType.SULPHUR_DIOXIDE:
            return 64.07
        case PollutantType.OZONE:
            return 48
        case _:
            raise (
                ValueError(
                    f"Unable to retrieve molecular weight for pollutant "
                    f"'{pollutant_type.value}'"
                )
            )
