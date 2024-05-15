# CAMS and Database data tool

### Date Options
* CAMS data updates after 11AM GMT, 
* Before 11AM use `model_base_date = yesterday`
* After 11AM use`model_base_date = today`

### steps
* Enter an array of desired steps

### cams_city_search_details
* the search details to filter returned CAMS data by
* the selected data will have the 'nearest' lat lon

### database_city_search_details
* the MongoDB query to find a specific subset of the database documents 
* eg, target city `{"city": "London"}` 

### Request bodies
* provide the ability to customise the single_level and multi_level requests

### Running the file
* When run, this goes through the following steps:
  * delete any documents in the QA `forecast_data` and `in_situ_data` collections
  * run `__main__.py`
  * get CAMS data based on the above params and print it to the terminal
  * export all data to excel (split by level)
  * get forecast_data based on the search criteria for the database and print it to the terminal