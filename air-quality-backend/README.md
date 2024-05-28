# Air Quality Backend

Please follow [Local Development Setup](#local-development-setup) instructions if this is the first time working on the project.

## Common Commands

### Update Conda environment

`conda env update --name air-quality-dev --file conda/environment.yml --prune`

### Run lint check
`python -m flake8`

### Run code formatter
`python -m black src tests scripts`

### Run all tests
`python -m pytest --cov=src/air_quality --cov=scripts tests`

### Run Fast API
Follow the tutorial [here](docs/run_fast_api_tutorial.md)

## Local Development Setup

### 1. Install Conda
Follow the [installation instructions](https://docs.anaconda.com/free/miniconda/) for conda.

### 2. Setup Conda Environment

#### Create Conda environment
From within air-quality-backend:

`conda env create -f conda/environment.yml -n air-quality-dev`

#### Activate Conda environment - CLI
`conda activate air-quality-dev`

#### Activate Conda environment - PyCharm
Follow these [instructions](https://www.jetbrains.com/help/pycharm/conda-support-creating-conda-virtual-environment.html#conda-requirements).

### 3. Install dependencies
`poetry install`

### 4. Setup .env file

#### Create .env file

`New-Item -ItemType file -Name ".env"`

Add in the following environment variables e.g.
```
MONGO_DB_URI=mongodb+srv://<username:password>@cluster0.ch5gkk4.mongodb.net/
MONGO_DB_NAME=air_quality_dashboard_db
OPEN_AQ_API_KEY=<api_key>
```

### 5. Get CDS API access (CAMS)
Create your .cdsapirc file as detailed [here](https://ads.atmosphere.copernicus.eu/api-how-to).

### 6. Get OpenAQ access
Register for a key [here](https://api.openaq.org/register).

Once you receive your key, place it in your **.env** file

### 7. Setup auto format on save (optional) 

#### PyCharm
- Go to File -> Settings -> Tools -> Black
- Select your conda env as the python interpreter
- Check 'On save'
- Press Apply
