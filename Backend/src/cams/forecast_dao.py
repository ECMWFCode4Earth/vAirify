import cdsapi
from datetime import date, timedelta
from enum import Enum
import xarray as xr


class ForecastDataType(Enum):
    NITROGEN_DIOXIDE = 'no2'
    OZONE = 'go3'
    PARTICULATE_MATTER_2_5 = 'pm2p5'
    PARTICULATE_MATTER_10 = 'pm10'
    SULPHUR_DIOXIDE = 'so2'

    def __eq__(self, other):
        return other.name == self.name and other.value == self.value

    def __hash__(self):
        return hash(self.value)


def _is_single_level(forecast_data_type: ForecastDataType) -> bool:
    is_pm2_5 = forecast_data_type == ForecastDataType.PARTICULATE_MATTER_2_5
    is_pm10 = forecast_data_type == ForecastDataType.PARTICULATE_MATTER_10
    return is_pm10 or is_pm2_5


class ForecastData:
    def __init__(self, single_level_data: xr.Dataset, multi_level_data: xr.Dataset):
        self.single_level_data = single_level_data
        self.multi_level_data = multi_level_data

    def get_data(self, forecast_data_type: ForecastDataType) -> xr.DataArray:
        if _is_single_level(forecast_data_type):
            return self.single_level_data[forecast_data_type.value]
        else:
            return self.multi_level_data[forecast_data_type.value]

    def get_step_values(self):
        return self.single_level_data['step'].values

    def get_time_value(self) -> int:
        return int(self.single_level_data['time'].values)


def get_base_request_body(model_base_date: str) -> dict:
    return {
        'date': f'{model_base_date}/{model_base_date}',
        'type': 'forecast',
        'format': 'grib',
        'time': '00:00',
        'leadtime_hour': [
            '24', '48', '72',
            '96', '120',
        ]
    }


def get_single_level_request_body(model_base_date: str) -> dict:
    base_request = get_base_request_body(model_base_date)
    base_request['variable'] = ['particulate_matter_10um', 'particulate_matter_2.5um']
    return base_request


def get_multi_level_request_body(model_base_date: str) -> dict:
    base_request = get_base_request_body(model_base_date)
    base_request['variable'] = ['nitrogen_dioxide', 'ozone', 'sulphur_dioxide']
    base_request['model_level'] = '137'
    return base_request


def fetch_cams_data(request_body, file_name) -> xr.Dataset:
    c = cdsapi.Client()
    print(f'Loading data from CAMS to file {file_name}, request body: {request_body}')
    c.retrieve(
        'cams-global-atmospheric-composition-forecasts',
        request_body,
        file_name
    )
    return xr.open_dataset(file_name, decode_times=False, engine='cfgrib', backend_kwargs={'indexpath': ''})


def fetch_forecast_data() -> ForecastData:
    model_base_date = (date.today() - timedelta(days=1)).strftime('%Y-%m-%d')
    single_level_data = fetch_cams_data(get_single_level_request_body(model_base_date), 'single_level.grib')
    multi_level_data = fetch_cams_data(get_multi_level_request_body(model_base_date), 'multi_level.grib')
    return ForecastData(single_level_data, multi_level_data)
