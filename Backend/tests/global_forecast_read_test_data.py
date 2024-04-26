import xarray

testCities = [
    {'name': 'Dublin', 'latitude': 53.350140, 'longitude': -6.266155},
    {'name': 'London', 'latitude': 51.509865, 'longitude': -0.118092},
    {'name': 'Paris', 'latitude': 48.864716, 'longitude': 2.349014},
]

pm2p5 = xarray.DataArray(
    data=[
        [
            [0.000000171, None, None],
            [None, 0.000000135, None],
            [None, None, 0.000000132],
        ],
        [
            [0.000000032, None, None],
            [None, 0.000000133, None],
            [None, None, 0.000000666],
        ]
    ],
    dims=['step', 'latitude', 'longitude'],
    coords=dict(
        step=[24, 48],
        latitude=([53.350140, 51.509865, 48.864716]),
        longitude=([-6.266155, -0.118092, 2.349014]),
    )
)

no2 = xarray.DataArray(
    data=[
        [
            [0.000000115, None, None],
            [None, 0.000000192, None],
            [None, None, 0.000000119],
        ],
        [
            [0.000000777, None, None],
            [None, 0.000000332, None],
            [None, None, 0.000000144],
        ]
    ],
    dims=['step', 'latitude', 'longitude'],
    coords=dict(
        step=[24, 48],
        latitude=([53.350140, 51.509865, 48.864716]),
        longitude=([-6.266155, -0.118092, 2.349014]),
    )
)

go3 = xarray.DataArray(
    data=[
        [
            [0.000000165, None, None],
            [None, 0.000000117, None],
            [None, None, 0.000000195],
        ],
        [
            [0.000000170, None, None],
            [None, 0.000000111, None],
            [None, None, 0.0000001],
        ]
    ],
    dims=['step', 'latitude', 'longitude'],
    coords=dict(
        step=[24, 48],
        latitude=([53.350140, 51.509865, 48.864716]),
        longitude=([-6.266155, -0.118092, 2.349014]),
    )
)

so2 = xarray.DataArray(
    data=[
        [
            [0.00000011, None, None],
            [None, 0.00000018, None],
            [None, None, 0.000000146],
        ],
        [
            [0.00000001, None, None],
            [None, 0.000000017, None],
            [None, None, 0.00000002],
        ]
    ],
    dims=['step', 'latitude', 'longitude'],
    coords=dict(
        step=[24, 48],
        latitude=([53.350140, 51.509865, 48.864716]),
        longitude=([-6.266155, -0.118092, 2.349014]),
    )
)

pm10 = xarray.DataArray(
    data=[
        [
            [0.000000140, None, None],
            [None, 0.000000167, None],
            [None, None, 0.000000139],
        ],
        [
            [0.000000100, None, None],
            [None, 0.000000157, None],
            [None, None, 0.00000012],
        ]
    ],
    dims=['step', 'latitude', 'longitude'],
    coords=dict(
        step=[24, 48],
        latitude=([53.350140, 51.509865, 48.864716]),
        longitude=([-6.266155, -0.118092, 2.349014]),
    )
)

single_level_data_set = xarray.Dataset(
    coords=dict(time=1713744000, step=[24, 48]),
    data_vars=dict(pm2p5=pm2p5, pm10=pm10))

multi_level_data_set = xarray.Dataset(
    coords=dict(time=1713744000, step=[24, 48]),
    data_vars=dict(no2=no2, go3=go3, so2=so2))

extract_result = [
    {
        'city': 'Dublin',
        'city_location': {'coordinates': [-6.266155, 53.35014], 'type': 'Point'},
        'measurement_date': 1713830400.0,
        'no2': 115,
        'o3': 165,
        'pm10': 140,
        'pm2_5': 171,
        'so2': 110
    },
    {
        'city': 'Dublin',
        'city_location': {'coordinates': [-6.266155, 53.35014], 'type': 'Point'},
        'measurement_date': 1713916800.0,
        'no2': 777,
        'o3': 170,
        'pm10': 100,
        'pm2_5': 32,
        'so2': 10
    },
    {
        'city': 'London',
        'city_location': {'coordinates': [-0.118092, 51.509865], 'type': 'Point'},
        'measurement_date': 1713830400.0,
        'no2': 192,
        'o3': 117,
        'pm10': 167,
        'pm2_5': 135,
        'so2': 180
    },
    {
        'city': 'London',
        'city_location': {'coordinates': [-0.118092, 51.509865], 'type': 'Point'},
        'measurement_date': 1713916800.0,
        'no2': 332,
        'o3': 111,
        'pm10': 157,
        'pm2_5': 133,
        'so2': 17
    },
    {
        'city': 'Paris',
        'city_location': {'coordinates': [2.349014, 48.864716], 'type': 'Point'},
        'measurement_date': 1713830400.0,
        'no2': 119,
        'o3': 195,
        'pm10': 139,
        'pm2_5': 132,
        'so2': 146
    },
    {
        'city': 'Paris',
        'city_location': {'coordinates': [2.349014, 48.864716], 'type': 'Point'},
        'measurement_date': 1713916800.0,
        'no2': 144,
        'o3': 100,
        'pm10': 120,
        'pm2_5': 666,
        'so2': 20
    }
]
