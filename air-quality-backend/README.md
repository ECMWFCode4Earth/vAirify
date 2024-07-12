# Air Quality Backend

Please follow [Local Development Setup](#local-development-setup) instructions if this is the first time working on the project.

## Common Commands

### Update Conda environment

`conda env update --name air-quality-dev --file conda/environment.yml --prune`

### Run lint check
`python -m flake8`

### Run code formatter
`python -m black src tests scripts`

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

# Other
### 7. Setup auto format on save (optional) 

#### PyCharm
- Go to File -> Settings -> Tools -> Black
- Select your conda env as the python interpreter
- Check 'On save'
- Press Apply

