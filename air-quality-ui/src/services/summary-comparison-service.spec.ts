import { createComparisonData } from './summary-comparison-service'
import { pollutantTypes } from '../models'
import {
  mockForecastResponseDto,
  mockMeasurementSummaryResponseDto,
} from '../test-util/mock-type-creator'

describe('Summary Comparison Service', () => {
  it('should return an empty array if no data is present', () => {
    const forecastData = {}
    const measurements = {}
    const comparisons = createComparisonData(forecastData, measurements)
    expect(comparisons).toEqual([])
  })

  it('should produce a comparison containing only latest forecast data when measurements are not available', () => {
    const forecastData = {
      London: [
        mockForecastResponseDto({
          location_name: 'London',
          valid_time: '2024-06-01T03:00:00Z',
          overall_aqi_level: 3,
          no2: { aqi_level: 3, value: 543 },
          so2: { aqi_level: 3, value: 543 },
          o3: { aqi_level: 3, value: 543 },
          pm10: { aqi_level: 3, value: 543 },
          pm2_5: { aqi_level: 3, value: 543 },
        }),
        mockForecastResponseDto({
          location_name: 'London',
          valid_time: '2024-06-01T00:00:00Z',
        }),
      ],
    }
    const measurements = {}
    const comparisons = createComparisonData(forecastData, measurements)
    expect(comparisons.length).toEqual(1)
    expect(comparisons[0].forecastOverallAqi).toEqual(3)
    expect(comparisons[0].locationName).toEqual('London')
    pollutantTypes.forEach((type) => {
      expect(comparisons[0][type].forecastData.validTime).toEqual(
        '2024-06-01T03:00:00Z',
      )
      expect(comparisons[0][type].forecastData.aqiLevel).toEqual(3)
      expect(comparisons[0][type].forecastData.value).toEqual(543)
      expect(comparisons[0][type].measurementData).toBeUndefined()
    })
  })

  it('should produce comparisons where forecast/averaged measurement highlight the largest differences', () => {
    const forecastData = {
      London: [
        mockForecastResponseDto({
          location_name: 'London',
          valid_time: '2024-06-01T00:00:00Z',
          overall_aqi_level: 5,
          no2: { aqi_level: 1, value: 1 },
          so2: { aqi_level: 2, value: 10 },
          o3: { aqi_level: 3, value: 20 },
          pm10: { aqi_level: 4, value: 50 },
          pm2_5: { aqi_level: 5, value: 100 },
        }),
        mockForecastResponseDto({
          location_name: 'London',
          valid_time: '2024-06-01T03:00:00Z',
          overall_aqi_level: 3,
          no2: { aqi_level: 3, value: 1 },
          so2: { aqi_level: 3, value: 10 },
          o3: { aqi_level: 3, value: 21 },
          pm10: { aqi_level: 4, value: 50 },
          pm2_5: { aqi_level: 5, value: 100 },
        }),
      ],
      Paris: [
        mockForecastResponseDto({
          location_name: 'Paris',
          valid_time: '2024-06-01T00:00:00Z',
          overall_aqi_level: 2,
          no2: { aqi_level: 3, value: 543 },
          so2: { aqi_level: 3, value: 543 },
          o3: { aqi_level: 3, value: 543 },
          pm10: { aqi_level: 3, value: 543 },
          pm2_5: { aqi_level: 3, value: 543 },
        }),
        mockForecastResponseDto({
          location_name: 'Paris',
          valid_time: '2024-06-01T03:00:00Z',
          no2: { aqi_level: 3, value: 543 },
          so2: { aqi_level: 3, value: 543 },
          o3: { aqi_level: 3, value: 543 },
          pm10: { aqi_level: 3, value: 543 },
          pm2_5: { aqi_level: 3, value: 543 },
        }),
      ],
    }
    const measurements = {
      London: [mockMeasurementSummaryResponseDto()],
    }
    const comparisons = createComparisonData(forecastData, measurements)
    expect(comparisons.length).toEqual(2)
    // expect(comparisons[0].forecastOverallAqi).toEqual(2)
    // expect(comparisons[0].locationName).toEqual('London')
    // pollutantTypes.forEach((type) => {
    //   expect(comparisons[0][type].forecastData.validTime).toEqual(
    //     '2024-06-01T03:00:00Z',
    //   )
    //   expect(comparisons[0][type].forecastData.aqiLevel).toEqual(3)
    //   expect(comparisons[0][type].forecastData.value).toEqual(543)
    //   expect(comparisons[0][type].measurementData).toBeUndefined()
    // })
  })
})
