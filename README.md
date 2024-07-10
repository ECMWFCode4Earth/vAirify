![Alt text](air-quality-ui/public/vAirifyLogo.png)
## The problem

The Copernicus Atmosphere Monitoring Service (CAMS) provides forecasts of air quality around the world. CAMS products have a wide reach to the general public through smartphone apps and, notably, through daily broadcasts of air quality index (AQI) forecasts for different cities by CNN International.  The accuracy of the forecasts in comparison to what actually is experienced can vary, which can be accentuated by local events (e.g. wildfires suddenly changing direction). Forecasts are currently quality checked via comparison with readings from high-end in-situ monitoring stations and satellite data, but not all of the world’s cities are covered, meaning that many forecasts go unchecked.

## The opportunity

The rise of affordable air quality sensors and data aggregation sites such as OpenAQ means that there are in-situ readings available for cities that are not currently quality-checked. The readings are not calibrated, there are often gaps and errors, but there is still an opportunity to increase the coverage of forecast quality-checking.

## Introducing vAirify

vAirify will regularly poll open air quality data so that it is as close to real-time as possible, and will apply a level of filtering to remove obviously inaccurate data. For a particular city vAirify will combine the readings to give a single value, which can then be compared with the forecast.

vAirify will provide an intuitive user interface that allows forecasters to explore variations between CAMS forecasts and the actual readings on the ground. At a glance, forecasters will be able to see the biggest differences, and will be able to drill down to the local area using a map view. vAirify will help forecasters make choices about the selection of observation stations, so that stations giving anomalous readings can be discounted.

To help forecasters to see long-term patterns, e.g. to determine whether a particular variation is a one-off or regular occurrence, vAirify will also be able to display historical data, for one city at a time.

Together these features will help forecasters improve the forecasting models and be more responsive to variations when they occur.
