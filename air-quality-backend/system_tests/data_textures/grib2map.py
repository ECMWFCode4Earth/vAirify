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

    # Normalize the data for bitmap conversion (e.g., scale to 0-255)
    normalized_data = 255 * (data - np.min(data)) / (np.max(data) - np.min(data))
    normalized_data = normalized_data.astype(np.uint8)

    # Plot the data using matplotlib
    plt.imshow(normalized_data, cmap='gray')
    plt.colorbar()
    plt.show()

    # Save as a bitmap using PIL
    img = Image.fromarray(normalized_data)
    img.save('output_bitmap.bmp')

    # Track the transformation of the specific value in the bitmap
    bitmap_value = normalized_data[idx]
    print(f"Transformed Value in Bitmap at ({target_lat}, {target_lon}): {bitmap_value}")



if __name__ == "__main__":
    gribbing()
