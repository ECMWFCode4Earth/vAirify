import {
  ForecastMeasurementComparison,
  PollutantComparisonData,
  createComparisonData,
  createSummaryRow,
} from './summary-comparison-service'
import { pollutantTypes } from '../models'
import {
  mockForecastResponseDto,
  mockMeasurementSummaryResponseDto,
} from '../test-util/mock-type-creator'

describe('Summary Comparison Service createComparisonData', () => {
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

describe('Summary Comparison Service createSummaryRow', () => {
  it('should set location and forecast AQI level from inputs', () => {
    const inputData: ForecastMeasurementComparison =
      mockForecastMeasurementComparison()

    const response = createSummaryRow(inputData)
    expect(response.locationName).toEqual('Bristol')
    expect(response.forecast.aqiLevel).toEqual(5)
  })
  it('should return forecast data for pollutants when no measurement data present', () => {
    const inputData: ForecastMeasurementComparison =
      mockForecastMeasurementComparison()

    inputData.no2.measurementData = undefined
    inputData.so2.measurementData = undefined
    inputData.o3.measurementData = undefined
    inputData.pm2_5.measurementData = undefined
    inputData.pm10.measurementData = undefined

    const response = createSummaryRow(inputData)

    expect(response.aqiDifference).toEqual(undefined)

    expect(response.forecast.aqiLevel).toEqual(5)
    expect(response.forecast.no2?.time).toEqual('t1')
    expect(response.forecast.no2?.aqiLevel).toEqual(1)
    expect(response.forecast.no2?.value).toEqual(1.1)
    expect(response.forecast.so2?.time).toEqual('t2')
    expect(response.forecast.so2?.aqiLevel).toEqual(2)
    expect(response.forecast.so2?.value).toEqual(2.1)
    expect(response.forecast.o3?.time).toEqual('t3')
    expect(response.forecast.o3?.aqiLevel).toEqual(3)
    expect(response.forecast.o3?.value).toEqual(3.1)
    expect(response.forecast.pm2_5?.time).toEqual('t4')
    expect(response.forecast.pm2_5?.aqiLevel).toEqual(4)
    expect(response.forecast.pm2_5?.value).toEqual(4.1)
    expect(response.forecast.pm10?.time).toEqual('t5')
    expect(response.forecast.pm10?.aqiLevel).toEqual(5)
    expect(response.forecast.pm10?.value).toEqual(5.1)
    expect(response.measurements).toEqual(undefined)
  })
  it('should return forecast data for pollutants when measurement data present', () => {
    const inputData: ForecastMeasurementComparison =
      mockForecastMeasurementComparison()

    const response = createSummaryRow(inputData)

    expect(response.aqiDifference).toEqual('0')

    expect(response.forecast.aqiLevel).toEqual(5)
    expect(response.forecast.no2?.time).toEqual('t1')
    expect(response.forecast.no2?.aqiLevel).toEqual(1)
    expect(response.forecast.no2?.value).toEqual(1.1)
    expect(response.forecast.so2?.time).toEqual('t2')
    expect(response.forecast.so2?.aqiLevel).toEqual(2)
    expect(response.forecast.so2?.value).toEqual(2.1)
    expect(response.forecast.o3?.time).toEqual('t3')
    expect(response.forecast.o3?.aqiLevel).toEqual(3)
    expect(response.forecast.o3?.value).toEqual(3.1)
    expect(response.forecast.pm2_5?.time).toEqual('t4')
    expect(response.forecast.pm2_5?.aqiLevel).toEqual(4)
    expect(response.forecast.pm2_5?.value).toEqual(4.1)
    expect(response.forecast.pm10?.time).toEqual('t5')
    expect(response.forecast.pm10?.aqiLevel).toEqual(5)
    expect(response.forecast.pm10?.value).toEqual(5.1)
  })
  it('should return measurement data for pollutants when measurement data present', () => {
    const inputData: ForecastMeasurementComparison =
      mockForecastMeasurementComparison()

    const response = createSummaryRow(inputData)

    expect(response.aqiDifference).toEqual('0')

    expect(response.measurements?.aqiLevel).toEqual(5)
    expect(response.measurements!.no2?.aqiLevel).toEqual(1)
    expect(response.measurements!.no2?.value).toEqual(1.1)
    expect(response.measurements!.so2?.aqiLevel).toEqual(2)
    expect(response.measurements!.so2?.value).toEqual(2.1)
    expect(response.measurements!.o3?.aqiLevel).toEqual(3)
    expect(response.measurements!.o3?.value).toEqual(3.1)
    expect(response.measurements!.pm2_5?.aqiLevel).toEqual(4)
    expect(response.measurements!.pm2_5?.value).toEqual(4.1)
    expect(response.measurements!.pm10?.aqiLevel).toEqual(5)
    expect(response.measurements!.pm10?.value).toEqual(5.1)
  })

  it('should pick pollutant with highest difference to return overall aqi level', () => {
    const inputData: ForecastMeasurementComparison =
      mockForecastMeasurementComparison()
    inputData.o3.forecastData.aqiLevel = 5
    inputData.o3.measurementData!.aqiLevel = 4
    inputData.pm10.forecastData.aqiLevel = 3
    inputData.pm10.measurementData!.aqiLevel = 1

    const response = createSummaryRow(inputData)

    expect(response.forecast.aqiLevel).toEqual(3)
    expect(response.measurements!.aqiLevel).toEqual(1)
    expect(response.aqiDifference).toEqual('+2')
  })

  it('should append minus sign to maximum difference amongst pollutants if forecast lower', () => {
    const inputData: ForecastMeasurementComparison =
      mockForecastMeasurementComparison()
    inputData.o3.forecastData.aqiLevel = 2
    inputData.o3.measurementData!.aqiLevel = 5

    const response = createSummaryRow(inputData)

    expect(response.aqiDifference).toEqual('-3')
  })

  it('should prefer postive AQI differences if absolute values are tied', () => {
    const inputData: ForecastMeasurementComparison =
      mockForecastMeasurementComparison()
    inputData.o3.forecastData.aqiLevel = 6
    inputData.o3.measurementData!.aqiLevel = 4
    inputData.so2.forecastData.aqiLevel = 4
    inputData.so2.measurementData!.aqiLevel = 6

    const response = createSummaryRow(inputData)

    expect(response.forecast.aqiLevel).toEqual(6)
    expect(response.measurements!.aqiLevel).toEqual(4)
    expect(response.aqiDifference).toEqual('+2')
  })

  it('should prefer higher absolute AQI value if difference is tied', () => {
    const inputData: ForecastMeasurementComparison =
      mockForecastMeasurementComparison()
    inputData.o3.forecastData.aqiLevel = 3
    inputData.o3.measurementData!.aqiLevel = 1
    inputData.pm10.forecastData.aqiLevel = 5
    inputData.pm10.measurementData!.aqiLevel = 3

    const response = createSummaryRow(inputData)

    expect(response.forecast.aqiLevel).toEqual(5)
    expect(response.measurements!.aqiLevel).toEqual(3)
    expect(response.aqiDifference).toEqual('+2')
  })

  it('should restrict forecasted and measured values to 1 decimal place', () => {
    const inputData: ForecastMeasurementComparison =
      mockForecastMeasurementComparison()
    inputData.o3.forecastData.value = 2.456
    inputData.o3.measurementData!.value = 4.567

    const response = createSummaryRow(inputData)

    expect(response.forecast.o3?.value).toEqual(2.5)
    expect(response.measurements!.o3?.value).toEqual(4.6)
  })
})

const mockForecastMeasurementComparison = (
  overrides?: Partial<ForecastMeasurementComparison>,
): ForecastMeasurementComparison => {
  return {
    forecastOverallAqi: 5,
    locationName: 'Bristol',
    no2: getPollutantComparisonData(1),
    so2: getPollutantComparisonData(2),
    o3: getPollutantComparisonData(3),
    pm2_5: getPollutantComparisonData(4),
    pm10: getPollutantComparisonData(5),
    ...overrides,
  }
}

const getPollutantComparisonData = (
  baseNum: number,
): PollutantComparisonData => {
  return {
    aqiDifference: baseNum,
    forecastData: {
      aqiLevel: baseNum,
      value: baseNum + 0.1,
      validTime: 't' + baseNum,
    },
    measurementData: {
      aqiLevel: baseNum,
      value: baseNum + 0.1,
    },
  }
}
