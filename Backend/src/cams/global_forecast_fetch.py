import os

import cdsapi
from datetime import date, timedelta
from enum import Enum

URL = 'https://ads.atmosphere.copernicus.eu/api/v2'
KEY = '19449:5414a2b7-5d9d-49a9-99c2-4a444a063261'


def fetch_forecast_data(target_file: str) -> None:
    if not os.path.isfile(target_file):
        c = cdsapi.Client(url=URL, key=KEY)
        model_base_date = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")
        request_body = {
            'date': f'{model_base_date}/{model_base_date}',
            'type': 'forecast',
            'format': 'grib',
            'variable': [
                'particulate_matter_10um', 'particulate_matter_2.5um', 'total_column_nitrogen_dioxide',
                'total_column_ozone', 'total_column_sulphur_dioxide'
            ],
            'time': '00:00',
            'leadtime_hour': ['24', '48', '72', '96', '120'],
        }

        print(f'Fetching data for model base date {model_base_date}, request body: {request_body}')

        c.retrieve(
            'cams-global-atmospheric-composition-forecasts',
            request_body,
            target_file)
