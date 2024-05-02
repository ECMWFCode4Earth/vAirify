# Air Quality Backend

## Common Commands

### Run main application
`python src/etl/__main__.py`

### Run lint check
`python -m flake8`

### Run auto formatter
`python -m black src tests`

### Run all tests in tests folder
`python -m pytest --cov=src tests`

## Conda

### Install conda
Follow the [installation instructions](https://docs.anaconda.com/free/miniconda/) for conda.

### To create environment
From within air-quality-backend

`conda env create -f conda/environment.yml -n dev`

### To update
`conda env update --name dev --file conda/environment.yml --prune`

### Point PyCharm to your environment
Follow these [instructions](https://www.jetbrains.com/help/pycharm/conda-support-creating-conda-virtual-environment.html#conda-requirements).


## Local Environment

### Setup .env file

Create

`New-Item -ItemType file -Name ".env"`

Add in your MongoDB Connection string e.g.
```
MONGO_DB_URI=mongodb+srv://username:password@cluster0.ch5gkk4.mongodb.net/
```

### CDS API access (CAMS)
Create your .cdsapirc file as detailed [here](https://ads.atmosphere.copernicus.eu/api-how-to).

### Setup auto format on save (PyCharm)

- Go to File -> Settings -> Tools -> Black
- Select your conda env as the python interpreter
- Check 'On save'
- Press Apply

