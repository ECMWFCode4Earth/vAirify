# Air Quality Backend

## Common Commands

### Run lint check
`python -m flake8`

### Run code formatter
`python -m black src tests scripts`

### Run all tests in etl tests folder
`python -m pytest --cov=src/etl --cov=scripts tests/etl_tests`

### Run all tests in api tests folder
`python -m pytest --cov=src/api tests/api_tests`

### Run Fast API
Follow the tutorial [here](docs/run_fast_api_tutorial.md)

## Conda

### Install conda
Follow the [installation instructions](https://docs.anaconda.com/free/miniconda/) for conda.

### To create environment
From within air-quality-backend
#### Etl Dev Environment
`conda env create -f conda/etl_environment.yml -n etl`
#### API Dev Environment
`conda env create -f conda/api_environment.yml -n api`

### To update
#### Etl Dev Environment
`conda env update --name etl --file conda/etl_environment.yml --prune`
#### API Dev Environment
`conda env update --name api --file conda/api_environment.yml --prune`

### Point PyCharm to your environment
Follow these [instructions](https://www.jetbrains.com/help/pycharm/conda-support-creating-conda-virtual-environment.html#conda-requirements).


## Local Environment

### Setup .env file

Create

`New-Item -ItemType file -Name ".env"`

Add in the following environment variables e.g.
```
MONGO_DB_URI=mongodb+srv://<username:password>@cluster0.ch5gkk4.mongodb.net/
MONGO_DB_NAME=air_quality_dashboard_db
OPEN_AQ_API_KEY=<api_key>
```

### CDS API access (CAMS)
Create your .cdsapirc file as detailed [here](https://ads.atmosphere.copernicus.eu/api-how-to).

### Setup auto format on save (PyCharm)

- Go to File -> Settings -> Tools -> Black
- Select your conda env as the python interpreter
- Check 'On save'
- Press Apply

