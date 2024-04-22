import os

import cdsapi
from datetime import date, timedelta


def fetch_forecast_data(target_file: str) -> None:
    c = cdsapi.Client()
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

