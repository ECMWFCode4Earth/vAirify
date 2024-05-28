from dotenv import load_dotenv
from logging import config
from air_quality.database.locations import get_locations_by_type
from air_quality.etl.in_situ.aqicn_dao import print_in_situ_measurements


config.fileConfig("./logging.ini")

load_dotenv()
locations = get_locations_by_type("city")[0:1]
print_in_situ_measurements(locations)
