# Install conda
Follow the [installation instructions](https://docs.anaconda.com/free/miniconda/) for conda.

# To create environment
From within air-quality-backend

`conda env create -f conda/environment.yml -n dev`

# Point PyCharm to your environment
Follow these [instructions](https://www.jetbrains.com/help/pycharm/conda-support-creating-conda-virtual-environment.html#conda-requirements).

# To update
`conda env update --name dev --file conda/environment.yml --prune`

# Run all tests in tests folder
`python -m pytest --cov=src tests`

# CDS API access (CAMS)
Create your .cdsapirc file as detailed [here](https://ads.atmosphere.copernicus.eu/api-how-to).

