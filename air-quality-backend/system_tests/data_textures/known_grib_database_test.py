import copy
from datetime import timezone, datetime, timedelta
import pprint
from PIL import Image, ImageChops
import pytest
from dotenv import load_dotenv

from etl.scripts.run_forecast_etl import main
import os
from unittest import mock

from system_tests.utils.database_utilities import (
    delete_database_data,
    get_database_data,
)

load_dotenv()
forecast_base_time = datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc)
data_query = {"forecast_base_time": {"$eq": forecast_base_time}}


@pytest.fixture(scope="module")
def setup_data():
    # Set up code
    with mock.patch.dict(
        os.environ,
        {"FORECAST_BASE_TIME": "2024-6-4 00", "FORECAST_RETRIEVAL_PERIOD": "0"},
    ):
        delete_database_data("data_textures", data_query)
        delete_database_data("forecast_data", data_query)

        main()
        yield


@pytest.mark.parametrize(
    "variable, forecast_base_date, expected_units, expected_max_value, expected_min_value",
    [
        (
            "aqi",
            datetime(2024, 6, 4, 3, 0, 0, tzinfo=timezone.utc),
            "fractional overall AQI",
            7,
            1,
        ),
        (
            "winds_10m",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "m s**-1",
            50,
            -50,
        ),
        (
            "no2",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "kg m**-3 * 1e-9",
            100,
            0,
        ),
        (
            "o3",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "kg m**-3 * 1e-9",
            500,
            0,
        ),
        (
            "pm10",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "kg m**-3 * 1e-9",
            1000,
            0,
        ),
        (
            "pm2_5",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "kg m**-3 * 1e-9",
            1000,
            0,
        ),
        (
            "so2",
            datetime(2024, 6, 4, 0, 0, 0, tzinfo=timezone.utc),
            "kg m**-3 * 1e-9",
            100,
            0,
        ),
    ],
)
def test__that_each_variable_has_correct_key_values(
    variable,
    forecast_base_date,
    setup_data,
    expected_units,
    expected_min_value,
    expected_max_value,
):
    query = copy.deepcopy(data_query)
    query["variable"] = variable
    query["forecast_base_time"] = {"$eq": forecast_base_time}

    stored_results = get_database_data("data_textures", query)
    assert len(stored_results) == 3

    for result in stored_results:
        assert (
            result["units"] == expected_units
        ), f"Expected units: {expected_units}, but got: {result['units']}"
        assert (
            result["min_value"] == expected_min_value
        ), f"Expected min_value: {expected_min_value}, but got: {result['min_value']}"
        assert (
            result["max_value"] == expected_max_value
        ), f"Expected max_value: {expected_max_value}, but got: {result['max_value']}"


def test__that_21_documents_are_fetched(setup_data):
    dict_result = get_database_data("data_textures", data_query)
    pprint.pprint(dict_result)
    expected_doc_count = 7 * 3
    assert (
        len(dict_result) == expected_doc_count
    ), f"Expected {expected_doc_count} documents for one forecast_base_time"


REFERENCE_DIR = os.path.join(os.path.dirname(__file__), "2024-06-04_00_comparisons")
GENERATED_DIR = os.path.join(os.path.dirname(__file__), "2024-06-04_00")
DIFF_DIR = os.path.join(os.path.dirname(__file__), "diff_image_store")

os.makedirs(DIFF_DIR, exist_ok=True)


def image_difference(image1, image2):
    diff = ImageChops.difference(image1, image2)
    if diff.getbbox():
        return diff, False
    return None, True


@pytest.mark.parametrize(
    "image_name",
    [
        "aqi_2024-06-04_00_CAMS_global.chunk_1_of_3.webp",
        "aqi_2024-06-04_00_CAMS_global.chunk_2_of_3.webp",
        "aqi_2024-06-04_00_CAMS_global.chunk_3_of_3.webp",
        "no2_2024-06-04_00_CAMS_global.chunk_1_of_3.webp",
        "no2_2024-06-04_00_CAMS_global.chunk_2_of_3.webp",
        "no2_2024-06-04_00_CAMS_global.chunk_3_of_3.webp",
        "o3_2024-06-04_00_CAMS_global.chunk_1_of_3.webp",
        "o3_2024-06-04_00_CAMS_global.chunk_2_of_3.webp",
        "o3_2024-06-04_00_CAMS_global.chunk_3_of_3.webp",
        "pm2_5_2024-06-04_00_CAMS_global.chunk_1_of_3.webp",
        "pm2_5_2024-06-04_00_CAMS_global.chunk_2_of_3.webp",
        "pm2_5_2024-06-04_00_CAMS_global.chunk_3_of_3.webp",
        "pm10_2024-06-04_00_CAMS_global.chunk_1_of_3.webp",
        "pm10_2024-06-04_00_CAMS_global.chunk_2_of_3.webp",
        "pm10_2024-06-04_00_CAMS_global.chunk_3_of_3.webp",
        "so2_2024-06-04_00_CAMS_global.chunk_1_of_3.webp",
        "so2_2024-06-04_00_CAMS_global.chunk_2_of_3.webp",
        "so2_2024-06-04_00_CAMS_global.chunk_3_of_3.webp",
        "winds_10m_2024-06-04_00_CAMS_global.chunk_1_of_3.webp",
        "winds_10m_2024-06-04_00_CAMS_global.chunk_2_of_3.webp",
        "winds_10m_2024-06-04_00_CAMS_global.chunk_3_of_3.webp",
    ],
)
def test__that_rendered_bitmaps_are_consistent(setup_data, image_name):
    reference_image_path = os.path.join(REFERENCE_DIR, image_name)
    generated_image_path = os.path.join(GENERATED_DIR, image_name)

    assert os.path.exists(
        reference_image_path
    ), f"Reference image {image_name} not found."
    assert os.path.exists(
        generated_image_path
    ), f"Generated image {image_name} not found."

    reference_image = Image.open(reference_image_path)
    generated_image = Image.open(generated_image_path)

    diff_image, are_identical = image_difference(reference_image, generated_image)

    if not are_identical:
        diff_image_path = os.path.join(DIFF_DIR, f"diff_{image_name}")
        diff_image.save(diff_image_path)
        pytest.fail(
            f"Images {image_name} do not match. Difference image saved at {diff_image_path}"
        )
