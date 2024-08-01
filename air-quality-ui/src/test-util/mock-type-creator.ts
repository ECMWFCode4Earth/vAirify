import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
  MeasurementsResponseDto,
} from '../services/types'

export const mockForecastResponseDto = (
  overrides?: Partial<ForecastResponseDto>,
): ForecastResponseDto => {
  return {
    base_time: '2024-06-01T00:00:00',
    valid_time: '2024-06-01T00:00:00',
    location: { longitude: 10, latitude: 20 },
    location_type: 'city',
    location_name: 'Bristol',
    overall_aqi_level: 5,
    no2: { aqi_level: 1, value: 1 },
    so2: { aqi_level: 2, value: 2 },
    o3: { aqi_level: 3, value: 3 },
    pm10: { aqi_level: 4, value: 4 },
    pm2_5: { aqi_level: 5, value: 5.123956 },
    ...overrides,
  }
}

export const mockMeasurementResponseDto = (
  overrides?: Partial<MeasurementsResponseDto>,
): MeasurementsResponseDto => {
  return {
    measurement_date: '2024-06-01T00:00:00',
    location_type: 'city',
    location_name: 'Bristol',
    location: { longitude: 10, latitude: 20 },
    api_source: 'test',
    entity: 'entity',
    sensor_type: 'A grade',
    site_name: 'site a',
    ...overrides,
  }
}

export const mockMeasurementSummaryResponseDto = (
  overrides?: Partial<MeasurementSummaryResponseDto>,
): MeasurementSummaryResponseDto => {
  return {
    measurement_base_time: '2024-06-01T00:00:00',
    location_type: 'city',
    location_name: 'Bristol',
    overall_aqi_level: { mean: 5 },
    ...overrides,
  }
}
