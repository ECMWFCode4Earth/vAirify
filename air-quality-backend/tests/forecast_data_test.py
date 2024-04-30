import pytest
from src.etl.forecast.forecast_data import ForecastDataType, is_single_level


@pytest.mark.parametrize("arg1, arg2, expected", [
    (ForecastDataType.PARTICULATE_MATTER_10, ForecastDataType.PARTICULATE_MATTER_10, True),
    (ForecastDataType.PARTICULATE_MATTER_2_5, ForecastDataType.PARTICULATE_MATTER_10, False),
    (ForecastDataType.PARTICULATE_MATTER_2_5, {}, False)
])
def test_forecast_data_type_equality(arg1, arg2, expected: bool):
    assert (arg1 == arg2) == expected


@pytest.mark.parametrize("data_type, expected", [
    (ForecastDataType.PARTICULATE_MATTER_10, True),
    (ForecastDataType.PARTICULATE_MATTER_2_5, True),
    (ForecastDataType.NITROGEN_DIOXIDE, False),
    (ForecastDataType.OZONE, False),
    (ForecastDataType.SULPHUR_DIOXIDE, False),
])
def test_forecast_data_type_equality(data_type: ForecastDataType, expected: bool):
    assert is_single_level(data_type) == expected
