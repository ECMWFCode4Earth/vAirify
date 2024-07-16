import {
  DefaultAqi3,
  DefaultAqi4,
  DefaultAqi5,
  DefaultAqi6,
} from './default_aqi_enums'

interface forecastAPIResponse {
  base_time: string
  valid_time: string
  location_type: string
  location_name: string
  overall_aqi_level: number
  no2: {
    aqi_level: number
    value: number
  }
  o3: {
    aqi_level: number
    value: number
  }
  pm2_5: {
    aqi_level: number
    value: number
  }
  pm10: {
    aqi_level: number
    value: number
  }
  so2: {
    aqi_level: number
    value: number
  }
}

interface measurementSummaryAPIResponse {
  measurement_base_time: string
  location_type: string
  location_name: string
  overall_aqi_level: {
    mean: number
  }
  no2: {
    mean: {
      aqi_level: number
      value: number
    }
  }
  o3: {
    mean: {
      aqi_level: number
      value: number
    }
  }
  pm2_5: {
    mean: {
      aqi_level: number
      value: number
    }
  }
  pm10: {
    mean: {
      aqi_level: number
      value: number
    }
  }
  so2: {
    mean: {
      aqi_level: number
      value: number
    }
  }
}

export function createForecastAPIResponseData(
  overrides: Partial<forecastAPIResponse> = {},
): forecastAPIResponse {
  const defaultForecastResponse = {
    base_time: '2024-07-08T00:00:00Z',
    valid_time: '2024-07-08T00:00:00Z',
    location_type: 'city',
    location_name: 'Los Angeles',
    overall_aqi_level: 3,
    no2: {
      aqi_level: DefaultAqi3.aqiLevel,
      value: DefaultAqi3.no2,
    },
    o3: {
      aqi_level: DefaultAqi3.aqiLevel,
      value: DefaultAqi3.o3,
    },
    pm2_5: {
      aqi_level: DefaultAqi3.aqiLevel,
      value: DefaultAqi3.pm2_5,
    },
    pm10: {
      aqi_level: DefaultAqi3.aqiLevel,
      value: DefaultAqi3.pm10,
    },
    so2: {
      aqi_level: DefaultAqi3.aqiLevel,
      value: DefaultAqi3.so2,
    },
  }

  return { ...defaultForecastResponse, ...overrides }
}

export function createForecastResponseWithValidTimeAndAQI(
  valid_time: string,
  aqiLevel: number,
) {
  let no2Value!: number
  let o3Value!: number
  let pm2_5Value!: number
  let pm10Value!: number
  let so2Value!: number

  switch (aqiLevel) {
    case 3:
      no2Value = DefaultAqi3.no2
      o3Value = DefaultAqi3.o3
      pm2_5Value = DefaultAqi3.pm2_5
      pm10Value = DefaultAqi3.pm10
      so2Value = DefaultAqi3.so2
      break
    case 4:
      no2Value = DefaultAqi4.no2
      o3Value = DefaultAqi4.o3
      pm2_5Value = DefaultAqi4.pm2_5
      pm10Value = DefaultAqi4.pm10
      so2Value = DefaultAqi4.so2
      break
    case 5:
      no2Value = DefaultAqi5.no2
      o3Value = DefaultAqi5.o3
      pm2_5Value = DefaultAqi5.pm2_5
      pm10Value = DefaultAqi5.pm10
      so2Value = DefaultAqi5.so2
      break
    case 6:
      no2Value = DefaultAqi6.no2
      o3Value = DefaultAqi6.o3
      pm2_5Value = DefaultAqi6.pm2_5
      pm10Value = DefaultAqi6.pm10
      so2Value = DefaultAqi6.so2
      break
  }
  return {
    base_time: '2024-07-08T00:00:00Z',
    valid_time: valid_time,
    location_type: 'city',
    location_name: 'Los Angeles',
    overall_aqi_level: aqiLevel,
    no2: { aqi_level: aqiLevel, value: no2Value },
    o3: { aqi_level: aqiLevel, value: o3Value },
    pm2_5: { aqi_level: aqiLevel, value: pm2_5Value },
    pm10: { aqi_level: aqiLevel, value: pm10Value },
    so2: { aqi_level: aqiLevel, value: so2Value },
  }
}

export function createMeasurementSummaryAPIResponseData(
  overrides: Partial<measurementSummaryAPIResponse> = {},
): measurementSummaryAPIResponse {
  const defaultMeasurementSummaryResponse = {
    measurement_base_time: '2024-07-08T00:00:00Z',
    location_type: 'city',
    location_name: 'Los Angeles',
    overall_aqi_level: {
      mean: 3,
    },
    no2: {
      mean: {
        aqi_level: DefaultAqi3.aqiLevel,
        value: DefaultAqi3.no2,
      },
    },
    o3: {
      mean: {
        aqi_level: DefaultAqi3.aqiLevel,
        value: DefaultAqi3.o3,
      },
    },
    pm2_5: {
      mean: {
        aqi_level: DefaultAqi3.aqiLevel,
        value: DefaultAqi3.pm2_5,
      },
    },
    pm10: {
      mean: {
        aqi_level: DefaultAqi3.aqiLevel,
        value: DefaultAqi3.pm10,
      },
    },
    so2: {
      mean: {
        aqi_level: DefaultAqi3.aqiLevel,
        value: DefaultAqi3.so2,
      },
    },
  }

  return { ...defaultMeasurementSummaryResponse, ...overrides }
}

export function createMeasurementSumResponseWithTimeAndAQI(
  measurementBaseTime: string,
  aqiLevel: number,
) {
  let no2Value!: number
  let o3Value!: number
  let pm2_5Value!: number
  let pm10Value!: number
  let so2Value!: number

  switch (aqiLevel) {
    case 3:
      no2Value = DefaultAqi3.no2
      o3Value = DefaultAqi3.o3
      pm2_5Value = DefaultAqi3.pm2_5
      pm10Value = DefaultAqi3.pm10
      so2Value = DefaultAqi3.so2
      break
    case 4:
      no2Value = DefaultAqi4.no2
      o3Value = DefaultAqi4.o3
      pm2_5Value = DefaultAqi4.pm2_5
      pm10Value = DefaultAqi4.pm10
      so2Value = DefaultAqi4.so2
      break
    case 6:
      no2Value = DefaultAqi6.no2
      o3Value = DefaultAqi6.o3
      pm2_5Value = DefaultAqi6.pm2_5
      pm10Value = DefaultAqi6.pm10
      so2Value = DefaultAqi6.so2
      break
  }
  return {
    measurement_base_time: measurementBaseTime,
    location_type: 'city',
    location_name: 'Los Angeles',
    overall_aqi_level: { mean: aqiLevel },
    no2: { mean: { aqi_level: aqiLevel, value: no2Value } },
    o3: { mean: { aqi_level: aqiLevel, value: o3Value } },
    pm2_5: { mean: { aqi_level: aqiLevel, value: pm2_5Value } },
    pm10: { mean: { aqi_level: aqiLevel, value: pm10Value } },
    so2: { mean: { aqi_level: aqiLevel, value: so2Value } },
  }
}
