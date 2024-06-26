import datetime

from system_tests.data.measurement_summary_api_test_data import create_location_values


def create_forecast_database_data_with_overrides(overrides):
    default_city = {
        "forecast_valid_time": datetime.datetime(
            2024, 6, 10, 3, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "source": "cams-production",
        "forecast_base_time": datetime.datetime(
            2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "location_type": "city",
        "name": "Test City 1",
        "forecast_range": 0,
        "last_modified_time": datetime.datetime(
            2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
        ),
        "location": create_location_values("point", [54.433746, 24.424399]),
        "no2": create_forecast_api_database_data_pollutant_value(1, 7.79346375328925),
        "o3": create_forecast_api_database_data_pollutant_value(4, 212.70172151472397),
        "overall_aqi_level": 6,
        "pm10": create_forecast_api_database_data_pollutant_value(6, 205.640266314635),
        "pm2_5": create_forecast_api_database_data_pollutant_value(
            4, 48.76003397454627
        ),
        "so2": create_forecast_api_database_data_pollutant_value(1, 7.58745619326088),
        "created_time": datetime.datetime(
            2024, 6, 10, 0, 0, 0, tzinfo=datetime.timezone.utc
        ),
    }

    return {**default_city, **overrides}


def create_forecast_api_database_data_pollutant_value(aqi_level, value):
    return {"aqi_level": aqi_level, "value": value}
