## Run Fast API (PyCharm)
Create a new config in Pycharm by clicking the dropdown menu 

![current_file_selector.png](images/fast_api_instructions/current_file_selector.png)

Edit configurations -> Then click the plus sign -> Then click python as shown bellow

![select_python.png](images/fast_api_instructions/select_python.png)

Enter the details shown below, and set the working directory to air-quality-backend 
```
module: uvicorn
air_quality.api.main:app --reload
```


Example:


![fast_api_config.png](images/fast_api_instructions/fast_api_config.png)

You can then run fast api using that configuration