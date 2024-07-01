class Routes:
    local_base_url = "http://localhost:8000/air-pollutant"
    forecast_api_endpoint = local_base_url + "/forecast"
    measurements_api_endpoint = local_base_url + "/measurements"
    measurements_summary_api_endpoint = measurements_api_endpoint + "/summary"
