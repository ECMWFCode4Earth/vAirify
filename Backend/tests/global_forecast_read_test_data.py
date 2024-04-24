import xarray

testCities = [
    {'name': 'Dublin', 'latitude': 53.350140, 'longitude': -6.266155},
    {'name': 'London', 'latitude': 51.509865, 'longitude': -0.118092},
    {'name': 'Paris', 'latitude': 48.864716, 'longitude': 2.349014},
]

pm2p5 = xarray.DataArray(
    data=[[
        [171, None, None],
        [None, 135, None],
        [None, None, 132],
    ],
        [
            [32, None, None],
            [None, 133, None],
            [None, None, 666],
        ]
    ],
    dims=['step', 'latitude', 'longitude'],
    coords=dict(
        step=[24, 48],
        latitude=([53.350140, 51.509865, 48.864716]),
        longitude=([-6.266155, -0.118092, 2.349014]),
    )
)

tcno2 = xarray.DataArray(
    data=[[
        [115, None, None],
        [None, 192, None],
        [None, None, 119],
    ],
        [
            [777, None, None],
            [None, 332, None],
            [None, None, 144],
        ]
    ],
    dims=['step', 'latitude', 'longitude'],
    coords=dict(
        step=[24, 48],
        latitude=([53.350140, 51.509865, 48.864716]),
        longitude=([-6.266155, -0.118092, 2.349014]),
    )
)

gtco3 = xarray.DataArray(
    data=[[
        [165, None, None],
        [None, 117, None],
        [None, None, 195],
    ],
        [
            [170, None, None],
            [None, 111, None],
            [None, None, 100],
        ]
    ],
    dims=['step', 'latitude', 'longitude'],
    coords=dict(
        step=[24, 48],
        latitude=([53.350140, 51.509865, 48.864716]),
        longitude=([-6.266155, -0.118092, 2.349014]),
    )
)

tcso2 = xarray.DataArray(
    data=[[
        [110, None, None],
        [None, 180, None],
        [None, None, 146],
    ],
        [
            [10, None, None],
            [None, 17, None],
            [None, None, 20],
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
    data=[[
        [140, None, None],
        [None, 167, None],
        [None, None, 139],
    ],
        [
            [100, None, None],
            [None, 157, None],
            [None, None, 120],
        ]
    ],
    dims=['step', 'latitude', 'longitude'],
    coords=dict(
        step=[24, 48],
        latitude=([53.350140, 51.509865, 48.864716]),
        longitude=([-6.266155, -0.118092, 2.349014]),
    )
)

data_set = xarray.Dataset(
    coords=dict(time=1713744000, step=[24, 48]),
    data_vars=dict(pm2p5=pm2p5, tcno2=tcno2, gtco3=gtco3, tcso2=tcso2, pm10=pm10))

extract_result = [{'city': 'Dublin',
                   'city_location': {'coordinates': [-6.266155, 53.35014], 'type': 'Point'},
                   'measurement_date': 1713830400.0,
                   'no2': 115,
                   'o3': 165,
                   'pm10': 140,
                   'pm2_5': 171,
                   'so2': 110},
                  {'city': 'Dublin',
                   'city_location': {'coordinates': [-6.266155, 53.35014], 'type': 'Point'},
                   'measurement_date': 1713916800.0,
                   'no2': 777,
                   'o3': 170,
                   'pm10': 100,
                   'pm2_5': 32,
                   'so2': 10},
                  {'city': 'London',
                   'city_location': {'coordinates': [-0.118092, 51.509865], 'type': 'Point'},
                   'measurement_date': 1713830400.0,
                   'no2': 192,
                   'o3': 117,
                   'pm10': 167,
                   'pm2_5': 135,
                   'so2': 180},
                  {'city': 'London',
                   'city_location': {'coordinates': [-0.118092, 51.509865], 'type': 'Point'},
                   'measurement_date': 1713916800.0,
                   'no2': 332,
                   'o3': 111,
                   'pm10': 157,
                   'pm2_5': 133,
                   'so2': 17},
                  {'city': 'Paris',
                   'city_location': {'coordinates': [2.349014, 48.864716], 'type': 'Point'},
                   'measurement_date': 1713830400.0,
                   'no2': 119,
                   'o3': 195,
                   'pm10': 139,
                   'pm2_5': 132,
                   'so2': 146},
                  {'city': 'Paris',
                   'city_location': {'coordinates': [2.349014, 48.864716], 'type': 'Point'},
                   'measurement_date': 1713916800.0,
                   'no2': 144,
                   'o3': 100,
                   'pm10': 120,
                   'pm2_5': 666,
                   'so2': 20}]
