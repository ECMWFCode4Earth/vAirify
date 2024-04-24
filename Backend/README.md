# Install conda
Follow the [installation instructions](https://docs.anaconda.com/free/miniconda/) for conda.

# To create environment
From within backend

`conda env create -f environment.yml -n challenge-16`

# Point PyCharm to your environment
Follow these [instructions](https://www.jetbrains.com/help/pycharm/conda-support-creating-conda-virtual-environment.html#conda-requirements).

# To update
`conda env update --name challenge-16 --file environment.yml --prune`

# Run all tests in tests folder
`python -m pytest tests`

# CDS API access (CAMS)
Create your .cdsapirc file as detailed [here](https://ads.atmosphere.copernicus.eu/api-how-to).

