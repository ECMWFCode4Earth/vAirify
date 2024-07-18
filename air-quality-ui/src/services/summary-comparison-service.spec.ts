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

  it('should produce a comparison for multiple locations', () => {
    const forecastData = {
      London: [
        mockForecastResponseDto({
          location_name: 'London',
          valid_time: '2024-06-01T03:00:00Z',
        }),
      ],
      Paris: [
        mockForecastResponseDto({
          location_name: 'Paris',
          valid_time: '2024-06-01T03:00:00Z',
        }),
      ],
    }
    const measurements = {}
    const comparisons = createComparisonData(forecastData, measurements)
    expect(comparisons.length).toEqual(2)
    expect(comparisons[0].locationName).toEqual('London')
    expect(comparisons[1].locationName).toEqual('Paris')
  })

  it('should produce comparisons where forecast/averaged measurement highlight the largest differences', () => {
    const forecastData = {
      London: [
        mockForecastResponseDto({
          location_name: 'London',
          valid_time: '2024-06-01T00:00:00Z',
          overall_aqi_level: 5,
          no2: { aqi_level: 1, value: 1 },
          so2: { aqi_level: 5, value: 5 },
        }),
        mockForecastResponseDto({
          location_name: 'London',
          valid_time: '2024-06-01T03:00:00Z',
          overall_aqi_level: 2,
          no2: { aqi_level: 1, value: 1 },
          so2: { aqi_level: 2, value: 2 },
        }),
      ],
    }
    const measurements = {
      London: [
        mockMeasurementSummaryResponseDto({
          location_name: 'London',
          measurement_base_time: '2024-06-01T00:00:00Z',
          no2: { mean: { aqi_level: 5, value: 5 } },
          so2: { mean: { aqi_level: 5, value: 5 } },
        }),
        mockMeasurementSummaryResponseDto({
          location_name: 'London',
          measurement_base_time: '2024-06-01T03:00:00Z',
          no2: { mean: { aqi_level: 3, value: 3 } },
          so2: { mean: { aqi_level: 1, value: 1 } },
        }),
      ],
    }
    const comparisons = createComparisonData(forecastData, measurements)
    expect(comparisons.length).toEqual(1)
    expect(comparisons[0].locationName).toEqual('London')

    expect(comparisons[0]['no2'].forecastData).toEqual({
      validTime: '2024-06-01T00:00:00Z',
      aqiLevel: 1,
      value: 1,
    })
    expect(comparisons[0]['no2'].measurementData).toEqual({
      aqiLevel: 5,
      value: 5,
    })
    expect(comparisons[0]['so2'].forecastData).toEqual({
      validTime: '2024-06-01T03:00:00Z',
      aqiLevel: 2,
      value: 2,
    })
    expect(comparisons[0]['so2'].measurementData).toEqual({
      aqiLevel: 1,
      value: 1,
    })
  })
  it('should produce comparisons with a preference of highest forecast when otherwise tied', () => {
    const forecastData = {
      London: [
        mockForecastResponseDto({
          valid_time: '2024-06-01T00:00:00Z',
          overall_aqi_level: 4,
          no2: { aqi_level: 4, value: 4 },
          so2: { aqi_level: 1, value: 1 },
        }),
        mockForecastResponseDto({
          valid_time: '2024-06-01T03:00:00Z',
          overall_aqi_level: 6,
          no2: { aqi_level: 6, value: 6 },
          so2: { aqi_level: 2, value: 2 },
        }),
      ],
    }
    const measurements = {
      London: [
        mockMeasurementSummaryResponseDto({
          measurement_base_time: '2024-06-01T00:00:00Z',
          no2: { mean: { aqi_level: 6, value: 6 } },
          so2: { mean: { aqi_level: 3, value: 3 } },
        }),
        mockMeasurementSummaryResponseDto({
          measurement_base_time: '2024-06-01T03:00:00Z',
          no2: { mean: { aqi_level: 4, value: 4 } },
          so2: { mean: { aqi_level: 4, value: 4 } },
        }),
      ],
    }
    const comparisons = createComparisonData(forecastData, measurements)
    expect(comparisons.length).toEqual(1)

    expect(comparisons[0]['no2'].forecastData).toEqual({
      validTime: '2024-06-01T03:00:00Z',
      aqiLevel: 6,
      value: 6,
    })
    expect(comparisons[0]['no2'].measurementData).toEqual({
      aqiLevel: 4,
      value: 4,
    })
    expect(comparisons[0]['so2'].forecastData).toEqual({
      validTime: '2024-06-01T03:00:00Z',
      aqiLevel: 2,
      value: 2,
    })
    expect(comparisons[0]['so2'].measurementData).toEqual({
      aqiLevel: 4,
      value: 4,
    })
  })
  it('should produce comparisons with defaulting to earliest when otherwise tied', () => {
    const forecastData = {
      London: [
        mockForecastResponseDto({
          valid_time: '2024-06-01T00:00:00Z',
          overall_aqi_level: 4,
          no2: { aqi_level: 4, value: 4 },
        }),
        mockForecastResponseDto({
          valid_time: '2024-06-01T03:00:00Z',
          overall_aqi_level: 4,
          no2: { aqi_level: 4, value: 4 },
        }),
      ],
    }
    const measurements = {
      London: [
        mockMeasurementSummaryResponseDto({
          measurement_base_time: '2024-06-01T00:00:00Z',
          no2: { mean: { aqi_level: 6, value: 6 } },
        }),
        mockMeasurementSummaryResponseDto({
          measurement_base_time: '2024-06-01T03:00:00Z',
          no2: { mean: { aqi_level: 6, value: 6 } },
        }),
      ],
    }
    const comparisons = createComparisonData(forecastData, measurements)
    expect(comparisons.length).toEqual(1)

    expect(comparisons[0]['no2'].forecastData).toEqual({
      validTime: '2024-06-01T00:00:00Z',
      aqiLevel: 4,
      value: 4,
    })
    expect(comparisons[0]['no2'].measurementData).toEqual({
      aqiLevel: 6,
      value: 6,
    })
  })
})
