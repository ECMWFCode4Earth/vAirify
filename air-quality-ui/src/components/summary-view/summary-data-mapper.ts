import { UseQueryResult } from '@tanstack/react-query'

import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../../services/types'

export interface CombinedSummaryData {
  data: {
    forecast?: ForecastResponseDto[]
    summarizedMeasurements?: MeasurementSummaryResponseDto[]
  }
  isPending?: boolean
  isError?: boolean
}

export const combineApiResult = ([forecast, summarizedMeasurements]: [
  Partial<UseQueryResult<ForecastResponseDto[], Error>>,
  Partial<UseQueryResult<MeasurementSummaryResponseDto[], Error>>,
]): CombinedSummaryData => {
  return {
    data: {
      forecast: forecast.data,
      summarizedMeasurements: summarizedMeasurements.data,
    },
    isPending: forecast.isPending || summarizedMeasurements.isPending,
    isError: forecast.isError || summarizedMeasurements.isError,
  }
}
