import { CaseAQI3, defaultCitySnapshotValues } from './test_enums'

interface forecastAPIResponse {
  base_time: string
  valid_time: string
  location_type: string
  location_name: string
  overall_aqi_level: number
  no2: { aqi_level: number; value: number }
  o3: { aqi_level: number; value: number }
  pm2_5: { aqi_level: number; value: number }
  pm10: { aqi_level: number; value: number }
  so2: { aqi_level: number; value: number }
}

interface measurementSummaryAPIResponse {
  measurement_base_time: string
  location_type: string
  location_name: string
  overall_aqi_level: {
    mean: number
  }
  no2: { mean: { aqi_level: number; value: number } }
  o3: { mean: { aqi_level: number; value: number } }
  pm2_5: { mean: { aqi_level: number; value: number } }
  pm10: { mean: { aqi_level: number; value: number } }
  so2: { mean: { aqi_level: number; value: number } }
}

interface measurementsCityPageAPIresponse {
  measurement_date: string
  location_type: string
  location_name: string
  location: { longitude: number; latitude: number }
  api_source: string
  no2: number
  o3: number
  pm2_5: number
  pm10: number
  so2: number
  entity: string
  sensor_type: string
  site_name: string
}
export function createMeasurementsCityPageResponseData(
  overrides: Partial<measurementsCityPageAPIresponse> = {},
): measurementsCityPageAPIresponse {
  const defaultMeasurementsCityPageResponse = {
    measurement_date: '2024-07-01T00:00:00Z',
    location_type: 'city',
    location_name: 'Rio de Janeiro',
    location: { longitude: -22.90642, latitude: -43.18223 },
    api_source: 'OpenAQ',
    no2: defaultCitySnapshotValues.no2,
    o3: defaultCitySnapshotValues.o3,
    pm2_5: defaultCitySnapshotValues.pm2_5,
    pm10: defaultCitySnapshotValues.pm10,
    so2: defaultCitySnapshotValues.so2,
    entity: 'Governmental Organisation',
    sensor_type: 'reference grade',
    site_name: 'Centro',
  }
  return { ...defaultMeasurementsCityPageResponse, ...overrides }
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
    no2: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.no2 },
    o3: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.o3 },
    pm2_5: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm2_5 },
    pm10: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm10 },
    so2: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.so2 },
  }

  return { ...defaultForecastResponse, ...overrides }
}

export function createForecastResponseWithValidTimeAndAQI(
  valid_time: string,
  aqiLevel: number,
) {
  return {
    base_time: '2024-07-08T00:00:00Z',
    valid_time: valid_time,
    location_type: 'city',
    location_name: 'Los Angeles',
    overall_aqi_level: aqiLevel,
    no2: { aqi_level: aqiLevel, value: 0 },
    o3: { aqi_level: aqiLevel, value: 0 },
    pm2_5: { aqi_level: aqiLevel, value: 0 },
    pm10: { aqi_level: aqiLevel, value: 0 },
    so2: { aqi_level: aqiLevel, value: 0 },
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
    no2: { mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.no2 } },
    o3: { mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.o3 } },
    pm2_5: { mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm2_5 } },
    pm10: { mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.pm10 } },
    so2: { mean: { aqi_level: CaseAQI3.aqiLevel, value: CaseAQI3.so2 } },
  }

  return { ...defaultMeasurementSummaryResponse, ...overrides }
}

export function createMeasurementSumResponseWithTimeAndAQI(
  measurementBaseTime: string,
  aqiLevel: number,
) {
  return {
    measurement_base_time: measurementBaseTime,
    location_type: 'city',
    location_name: 'Los Angeles',
    overall_aqi_level: { mean: aqiLevel },
    no2: { mean: { aqi_level: aqiLevel, value: 0 } },
    o3: { mean: { aqi_level: aqiLevel, value: 0 } },
    pm2_5: { mean: { aqi_level: aqiLevel, value: 0 } },
    pm10: { mean: { aqi_level: aqiLevel, value: 0 } },
    so2: { mean: { aqi_level: aqiLevel, value: 0 } },
  }
}
