import { LocationType, PollutantType } from '../models'

export interface PollutantDataDto {
  aqi_level: number
  value: number
}

export interface PollutantAverageDataDto<T> {
  mean: T
  median: T
}

type ForecastPollutantDataDto = {
  [P in PollutantType]: PollutantDataDto
}

type SummaryMeasurementPollutantDataDto = {
  [P in PollutantType]?: PollutantAverageDataDto<PollutantDataDto>
}

export type ForecastResponseDto = {
  base_time: string
  valid_date: string
  location_type: LocationType
  location_name: string
  overall_aqi_level: number
} & ForecastPollutantDataDto

export type MeasurementSummaryResponseDto = {
  measurement_base_time: string
  location_type: LocationType
  location_name: string
  overall_aqi_level: PollutantAverageDataDto<number>
} & SummaryMeasurementPollutantDataDto
