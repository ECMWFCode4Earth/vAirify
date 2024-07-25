import csv

from dotenv import load_dotenv

from system_tests.utils.database_utilities import get_database_data

load_dotenv()
collection_name = "locations"


def test__locations_collection__all_marked_city():
    locations = get_database_data(collection_name)

    for location in locations:
        assert location["type"] == "city", f"type '{location['type']}' is not city"


def test__locations_collection__represents_all_cities_from_the_setup_file():
    def db_location_converter(loc):
        return f"{loc['name']}|{loc['country']}|{loc['latitude']}|{loc['longitude']}"

    def file_location_converter(loc):
        return f"{loc['city']}|{loc['country']}|{loc['latitude']}|{loc['longitude']}"

    locations_collection = get_database_data(collection_name)
    stored_locations = list(map(db_location_converter, locations_collection))

    config_source = "../deployment/database/CAMS_locations_V1.csv"
    with open(config_source, newline="", encoding="UTF-8") as f:
        reader = csv.DictReader(f)
        file_locations = list(reader)

    expected_locations = list(map(file_location_converter, file_locations))

    assert stored_locations == expected_locations
