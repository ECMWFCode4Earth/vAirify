import datetime
from unittest.mock import patch, call

import pytest

from air_quality.etl.in_situ.openaq_orchestrator import (
    retrieve_openaq_in_situ_data,
)

cities = "dummy_cities_var"
end_date = datetime.datetime(2024, 3, 29, 9, 18)


@pytest.mark.parametrize(
    "period_hours, no_of_forecasts",
    [
        (1, 9),
        (12, 12),
        (72, 32),
        (0, 8),
    ],
)
@patch("air_quality.etl.in_situ.openaq_orchestrator.fetch_in_situ_measurements")
@patch("air_quality.etl.in_situ.openaq_orchestrator.fetch_forecast_data")
def test__retrieve_openaq_in_situ_data__external_apis_called_correctly(
    fetch_forecast_patch, fetch_in_situ_patch, period_hours, no_of_forecasts
):

    start_date = end_date - datetime.timedelta(hours=period_hours)

    retrieve_openaq_in_situ_data(cities, end_date, period_hours)

    # no of forecasts is based upon the date range asked for, with an extra day to
    # ensure the forecast range is a superset of the in-situ range
    fetch_forecast_patch.assert_called_with(start_date, no_of_forecasts)
    fetch_in_situ_patch.assert_called_with(cities, start_date, end_date)


@patch("air_quality.etl.in_situ.openaq_orchestrator.enrich_with_forecast_data")
@patch("air_quality.etl.in_situ.openaq_orchestrator.transform_city")
@patch("air_quality.etl.in_situ.openaq_orchestrator.fetch_forecast_data")
@patch("air_quality.etl.in_situ.openaq_orchestrator.fetch_in_situ_measurements")
def test__retrieve_openaq_in_situ_data__transform_calls_made_per_city(
    fetch_in_situ_patch,
    fetch_forecast_patch,
    transform_city_patch,
    enrich_with_forecast_data_patch,
):

    extracted_forecast = "dummy_forecasts_var"
    dublin_data = "dummy_dublin_data"
    london_data = "dummy_london_data"
    transformed_dublin_data = "transformed_dummy_dublin_data"
    transformed_london_data = "transformed_dummy_london_data"
    enriched_dublin_data = "enriched_dummy_dublin_data"
    enriched_london_data = "enriched_dummy_london_data"

    in_situ_data = {"Dublin": dublin_data, "London": london_data}

    fetch_forecast_patch.return_value = extracted_forecast
    fetch_in_situ_patch.return_value = in_situ_data

    transform_city_patch.side_effect = lambda x: {
        dublin_data: transformed_dublin_data,
        london_data: transformed_london_data,
    }[x]

    enrich_with_forecast_data_patch.side_effect = lambda *x: {
        (transformed_dublin_data, extracted_forecast): [enriched_dublin_data],
        (transformed_london_data, extracted_forecast): [enriched_london_data],
    }[x]

    expected = [enriched_dublin_data, enriched_london_data]

    response = retrieve_openaq_in_situ_data(cities, end_date, 12)

    assert expected == response
    transform_city_patch.assert_has_calls([call(dublin_data), call(london_data)])
    enrich_with_forecast_data_patch.assert_has_calls(
        [
            call(transformed_dublin_data, extracted_forecast),
            call(transformed_london_data, extracted_forecast),
        ]
    )
