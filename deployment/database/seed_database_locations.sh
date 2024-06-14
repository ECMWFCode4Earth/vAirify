#! /usr/bin/bash

python3 -m venv .venv
source .venv/bin/activate

DB_URI=${1:-'mongodb://localhost:27017'}
DB_COLLECTION=${2:-'air_quality_dashboard_db'}

pip install pymongo pandas

python3 add_cities_to_locations.py $DB_URI $DB_COLLECTION

deactivate

rm -rf .venv