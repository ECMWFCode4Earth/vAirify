export const mockedForecastResponse = [
  {
    base_time: '2024-06-19T00:00:00Z',
    valid_time: '2024-06-19T09:00:00Z',
    location_type: 'city',
    location_name: 'Kampala',
    overall_aqi_level: 2,
    no2: {
      aqi_level: 1,
      value: 0.3812829140487199,
    },
    o3: {
      aqi_level: 2,
      value: 72.9086035913633,
    },
    pm2_5: {
      aqi_level: 2,
      value: 16.067128848211063,
    },
    pm10: {
      aqi_level: 2,
      value: 26.087666551144732,
    },
    so2: {
      aqi_level: 1,
      value: 0.6314619719025142,
    },
  },
  {
    base_time: '2024-06-19T00:00:00Z',
    valid_time: '2024-06-19T12:00:00Z',
    location_type: 'city',
    location_name: 'Abu Dhabi',
    overall_aqi_level: 3,
    no2: {
      aqi_level: 1,
      value: 5.871611751344455,
    },
    o3: {
      aqi_level: 4,
      value: 213.04088459925424,
    },
    pm2_5: {
      aqi_level: 4,
      value: 30.29016575805515,
    },
    pm10: {
      aqi_level: 4,
      value: 58.25755291558235,
    },
    so2: {
      aqi_level: 1,
      value: 8.497931484924965,
    },
  },
  {
    base_time: '2024-06-19T00:00:00Z',
    valid_time: '2024-06-19T12:00:00Z',
    location_type: 'city',
    location_name: 'Zurich',
    overall_aqi_level: 3,
    no2: {
      aqi_level: 1,
      value: 1.2220194497781245,
    },
    o3: {
      aqi_level: 3,
      value: 110.29793453644987,
    },
    pm2_5: {
      aqi_level: 2,
      value: 17.161946368293673,
    },
    pm10: {
      aqi_level: 2,
      value: 31.71802172436572,
    },
    so2: {
      aqi_level: 1,
      value: 1.3459434727665889,
    },
  },
  // City should not show up.
  {
    base_time: '2024-06-24T00:00:00Z',
    valid_time: '2024-06-24T09:00:00Z',
    location_type: 'city',
    location_name: 'Kyiv',
    overall_aqi_level: 2,
    no2: {
      aqi_level: 1,
      value: 0.7852695955767444,
    },
    o3: {
      aqi_level: 2,
      value: 80.0214446372413,
    },
    pm2_5: {
      aqi_level: 1,
      value: 7.024702103355023,
    },
    pm10: {
      aqi_level: 1,
      value: 10.313057730041718,
    },
    so2: {
      aqi_level: 1,
      value: 0.465807542763243,
    },
  },
]

export const mockedMeasurementSummaryResponse = [
  {
    measurement_base_time: '2024-06-19T09:00:00Z',
    location_type: 'city',
    location_name: 'Kampala',
    overall_aqi_level: {
      mean: 6,
    },
    pm2_5: {
      mean: {
        aqi_level: 6,
        value: 76,
      },
    },
  },
  {
    measurement_base_time: '2024-06-19T12:00:00Z',
    location_type: 'city',
    location_name: 'Abu Dhabi',
    overall_aqi_level: {
      mean: 5,
    },
    pm2_5: {
      mean: {
        aqi_level: 5,
        value: 52.75,
      },
    },
  },
  {
    measurement_base_time: '2024-06-19T12:00:00Z',
    location_type: 'city',
    location_name: 'Zurich',
    overall_aqi_level: {
      mean: 2,
    },
    pm2_5: {
      mean: {
        aqi_level: 2,
        value: 15.764618078867594,
      },
    },
    pm10: {
      mean: {
        aqi_level: 1,
        value: 16.039256008466086,
      },
    },
  },
]
