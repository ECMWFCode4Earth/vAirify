class Routes:
    local_base_url = "http://127.0.0.1:8000/air-pollutant"
    forecast_api_endpoint = local_base_url + "/forecast"
    measurements_api_endpoint = local_base_url + "/measurements"
    measurements_summary_api_endpoint = measurements_api_endpoint + "/summary"
