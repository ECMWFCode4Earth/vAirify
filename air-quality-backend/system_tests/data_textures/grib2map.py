import pprint
import numpy as np
import pygrib
from PIL import Image
import matplotlib.pyplot as plt

def gribbing():

    single_grib = 'single_level_41_from_2024-06-10_00.grib'
    grib_open = pygrib.open(single_grib)

    message = grib_open.message(5)

    pprint.pprint(message)

    data, lats , lons = message.data()

    target_lat = -22.90642
    target_lon = -43.18223

    dist = np.sqrt((lats - target_lat) ** 2 + (lons - target_lon) ** 2)
    idx = np.unravel_index(dist.argmin(), dist.shape)
    tracked_value = data[idx]

    print(f"Original Value at ({target_lat}, {target_lon}): {tracked_value}")

    # Normalize the data for bitmap conversion using greyscale 0-255
    # pm10 is 0 - 1000 replace min and max accordingly
    normalized_data = 255 * (data - np.min(data)) / (np.max(data) - np.min(data))
    normalized_data = np.clip(normalized_data, 0, 255) #clip values
    normalized_data = normalized_data.astype(np.uint8)

    bitmap_value = normalized_data[idx]
    print(f"Transformed Value in Bitmap at ({target_lat}, {target_lon}): {bitmap_value}")

    # Plot the data using matplotlib

    plt.imshow(normalized_data, cmap='gray')

    # Save as a bitmap using PIL
    img = Image.fromarray(normalized_data)
    img.save('output_bitmap.bmp')

    # coords to check subsample maybe 6 points
    point1_coords = (10, 20)
    point2_coords = (30, 40)

    bitmap_value_point1 = normalized_data[point1_coords]
    bitmap_value_point2 = normalized_data[point2_coords]

    print(f"Bitmap Value at {point1_coords}: {bitmap_value_point1}")
    print(f"Bitmap Value at {point2_coords}: {bitmap_value_point2}")
    plt.show()
if __name__ == "__main__":
    gribbing()