# Air Quality Notebooks
A collection of Jupyter Notebooks to explore scientific and technical challenges we encountered during the development of vAirify. Notebooks are written in a self-contained format whenever possible, i.e. they do not access methods or databases from the backend, api or dashboard so they can still be executed in case these components are changed in the future. All necessary data is being stored in the `notebooks/data` directory.

Figures are saved to the `notebooks/figures` directory and main results and conclusions for each notebook are added to the vAirify wiki in this repository. 

The notebooks are available both as Jupyter Notebook files `.ipynb` (containing code+output), as well as in plain `.py` files using the `py:percent` [notebook format](https://github.com/mwouts/jupytext/blob/main/docs/formats-scripts.md#the-percent-format). All necessary packages can be installed via `conda` (see below).

## Overview

1. [Overview of available city-level data from the OpenAQ API ](01_openaq-data-overview.ipynb)
## Conda

### Install conda
Follow the [installation instructions](https://docs.anaconda.com/free/miniconda/) for conda.

### To create environment
From within the `notebooks` directory:

`conda env create -f nbk_environment.yml -n vairify-nbk`

### To update
`conda env update --name vairify-nbk --file nbk_environment.yml --prune`

## Paired Notebooks
We use the [jupytext](https://github.com/mwouts/jupytext) package to automatically save a plain python script (*.py) each time the notebook is saved. This is very helpful for clean diffs in the version control and allows you to run the analysis in your local terminal with:

`python notebook_name.py`

The python file can also be shared with others to work on the code together using all the version control benefits (branches, pull requests, ...). You can edit it with any text editor/IDE and it can also be converted back to a jupyter notebook (with no output) via:

`jupytext --to notebook notebook_name.py`

The `.ipynb` and `.py` in this directory are automatically paired via the `jupytext.toml` config file. Whenever you change one of the files within Jupyter Lab, the `.ipynb` or `.py` pendant will be automatically created/modified. 
