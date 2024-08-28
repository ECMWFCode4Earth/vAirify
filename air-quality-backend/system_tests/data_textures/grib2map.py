import pprint
import numpy as np
import pygrib
from PIL import Image
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap

def gribbing():
    single_grib = 'single_level_41_from_2024-06-10_00.grib'
    grib_open = pygrib.open(single_grib)

    message = grib_open.message(5) #Determines which variable we look at. E.g. 5 is PM10 at 00:00
    pprint.pprint(message)


    data, lats, lons = message.data() # Extract data, latitudes, and longitudes

    # Specify the target latitude and longitude, Rio De Janeiro
    target_lat = -22.90642
    target_lon = -43.18223

    # Find the nearest grid point to the target coordinates
    dist = np.sqrt((lats - target_lat) ** 2 + (lons - target_lon) ** 2)
    idx = np.unravel_index(dist.argmin(), dist.shape)
    tracked_value = data[idx] #our original pollutant value from the GRIB

    print(f"Original Value at ({target_lat}, {target_lon}): {tracked_value}")

    # Normalize the data for bitmap conversion using greyscale 0-255
    # pm10 is 0 - 1000 replace min and max accordingly
    # clip values to 255 using np.clip
    normalized_data = 255 * (data - np.min(data)) / (np.max(data) - np.min(data))
    normalized_data = normalized_data.astype(np.uint8)

    # Initialize a figure and axis
    fig, ax = plt.subplots(figsize=(12, 6))

    # Create a Basemap instance for better visualisation
    m = Basemap(projection='cyl', resolution='l', llcrnrlat=lats.min(), urcrnrlat=lats.max(),
                llcrnrlon=lons.min(), urcrnrlon=lons.max(), ax=ax)

    # Draw coastlines and countries for context
    m.drawcoastlines()
    m.drawcountries()

    # Instead of creating a meshgrid, directly use the lats and lons with the data
    x, y = m(lons, lats)

    # Overlay the bitmap data on top of the world map
    # Using `imshow` with `extent` directly, alpha can be tweaked to liking
    bitmap = ax.imshow(normalized_data, extent=[lons.min(), lons.max(), lats.min(), lats.max()],
                       cmap='gray', alpha=0.6, origin='upper')

    # Add a colorbar
    plt.colorbar(bitmap, ax=ax, orientation='horizontal', pad=0.05)

    # Show the plot
    plt.show()

    # Save as a bitmap using PIL
    img = Image.fromarray(normalized_data)
    img.save('output_bitmap_with_worldmap.bmp')

    # Track the transformation of the specific value in the bitmap
    bitmap_value = normalized_data[idx]
    print(f"Transformed Value in Bitmap at ({target_lat}, {target_lon}): {bitmap_value}")


if __name__ == "__main__":
    gribbing()
