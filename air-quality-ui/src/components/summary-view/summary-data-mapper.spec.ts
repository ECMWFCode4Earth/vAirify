import { combineApiResult } from './summary-data-mapper'
import {
  mockForecastResponseDto,
  mockMeasurementSummaryResponseDto,
} from '../../test-util/mock-type-creator'

describe('Summary Data Mapper', () => {
  it('should combine results from api calls when available', () => {
    const forecastData = mockForecastResponseDto()
    const summaryData = mockMeasurementSummaryResponseDto()
    const { data } = combineApiResult([
      {
        data: [forecastData],
        isPending: false,
        isError: false,
        status: 'success',
      },
      {
        data: [summaryData],
        isPending: false,
        isError: false,
        status: 'success',
      },
    ])
    expect(data.forecast).toEqual([forecastData])
    expect(data.summarizedMeasurements).toEqual([summaryData])
  })
  it('should return isPending flag', () => {
    const { isPending } = combineApiResult([
      { data: undefined, isPending: true, isError: false, status: 'pending' },
      { data: undefined, isPending: true, isError: false, status: 'pending' },
    ])
    expect(isPending).toBe(true)
  })
  it('should return isError flag', () => {
    const { isError } = combineApiResult([
      { data: undefined, isPending: false, isError: true, status: 'error' },
      { data: undefined, isPending: false, isError: true, status: 'error' },
    ])
    expect(isError).toBe(true)
  })
})
