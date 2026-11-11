# Air Quality Backend

Please follow [Local Development Setup](#local-development-setup) instructions if this is the first time working on the project.

## Common Commands

### Update Conda environment

`conda env update --name air-quality-dev --file conda/environment.yml --prune`

### Run lint check
`python -m flake8`

### Run code formatter
`python -m black api etl system_tests`

### Run tests
```
python -m pytest api/tests --cov=api
python -m pytest etl/tests --cov=etl
python -m pytest shared/tests --cov=shared
```
### Run Fast API
Follow the tutorial [here](docs/run_fast_api_tutorial.md)

# Dev setup
## ETL Local Development Setup

### 1. Install Conda
Follow the [installation instructions](https://docs.anaconda.com/free/miniconda/) for conda.

### 2. Setup Conda Environment

#### Create Conda environment
From within air-quality-backend/etl:

`conda env create -f conda/environment.yml -n air-quality-dev`

#### Activate Conda environment - CLI
`conda activate air-quality-dev`

#### Activate Conda environment - PyCharm
Follow these [instructions](https://www.jetbrains.com/help/pycharm/conda-support-creating-conda-virtual-environment.html#conda-requirements).

### 3. Install dependencies
`poetry install`

## API Local Development Setup
from air-quality-backend/api:

ensure version of python installed is at least 3.11

create python venv
`python -m venv .venv`

activate the venv
```
linux - `source .venv/bin/activate`

windows - `.venv/bin/activate`
```
for windows you may need to run the following to run the activate command
`Set-ExecutionPolicy AllSigned`

when activated install dependecies

`pip install -r requirements-dev.txt`

to run the shared unit tests also run 
`pip install -r requirements-test.txt`
from the shared directory

## Setup .env file

#### Create .env file

`New-Item -ItemType file -Name ".env"`

Add in the following environment variables e.g.
```
MONGO_DB_URI=mongodb://localhost:27017
MONGO_DB_NAME=air_quality_dashboard_db
OPEN_AQ_API_URL=https://api.openaq.org
OPEN_AQ_API_KEY=<api_key>
CDSAPI_URL=https://ads.atmosphere.copernicus.eu/api/v2
CDSAPI_KEY=<cds_api_key>
```

#### Get OpenAQ access
Register for a key [here](https://api.openaq.org/register).

Once you receive your key, place it in your **.env** file


## Docker
### Locally
from the root directory, ensure a valid .env file is in the directory and then run. 
```
docker compose up -d
```
There is a separate compose file for deployments found in the deployment directory

### build individual images

You can build the docker image with the following... 
```
    docker build . -t <image_name> -f <dockerfile>

    e.g. 
    docker build . -t forecast_etl -f Dockerfile.forecast
```

To run the docker image (from the base air-quality-backend directory)
```
    docker run --env-file <environment_file> <image_name>

    e.g.
    docker run --env_file .env forecast_etl
```

## Backfilling in-situ data
The in-situ cron (`etl/scripts/run_in_situ_etl.py`) re-fetches any 24 hour window
within the last `IN_SITU_RETRIEVAL_PERIOD` days (default 14) that has missing hours.
It makes one OpenAQ request per sensor per day, which is too slow for long periods
under OpenAQ's rate limit of 2,000 requests per hour.

For long periods use `etl/scripts/run_in_situ_backfill.py`. It selects the same
windows as the cron, but requests each sensor once per chunk of up to 40 days. The
results are split into the cron's windows and written to its `OPEN_AQ_CACHE` files.
The cron pipeline then reads those files and transforms, enriches (CAMS) and stores
each window, so the stored documents are the same as the cron would produce.

| Variable | Default | Purpose |
| --- | --- | --- |
| `IN_SITU_RETRIEVAL_PERIOD` | 14 | Days to look back |
| `IN_SITU_BACKFILL_DIR` | `./in_situ_backfill` | Cache and progress files; mount a volume to keep them across restarts |
| `IN_SITU_BACKFILL_CHUNK_DAYS` | 40 | Days fetched per sensor request (40 days of hourly data fits in one page) |
| `OPEN_AQ_MIN_REQUEST_INTERVAL` | 1.85 | Seconds between OpenAQ requests, keeping under the hourly limit |

The run can be resumed. If it stops, start it again with the same
`IN_SITU_BACKFILL_DIR`: it reuses the saved windows and skips those already stored.
Stop any other process using the same OpenAQ key first, because they share the rate limit.

```
docker compose run -d --name insitu-backfill \
  -e IN_SITU_RETRIEVAL_PERIOD=183 \
  -e IN_SITU_BACKFILL_DIR=/app/in_situ_backfill \
  -v /usr/config/in_situ_backfill:/app/in_situ_backfill \
  etl-insitu \
  conda run --no-capture-output -n air-quality-backend PYTHONPATH=/app python3 /app/etl/scripts/run_in_situ_backfill.py
```

# Other
### 7. Setup auto format on save (optional) 

#### PyCharm
- Go to File -> Settings -> Tools -> Black
- Select your conda env as the python interpreter
- Check 'On save'
- Press Apply

