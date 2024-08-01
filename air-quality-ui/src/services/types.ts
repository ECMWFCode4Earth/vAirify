import { LocationType, PollutantType } from '../models'

export interface PollutantDataDto {
  aqi_level: number
  value: number
}

export interface PollutantAverageDataDto<T> {
  mean: T
}

type ForecastPollutantDataDto = {
  [P in PollutantType]: PollutantDataDto
}

type MeasurementPollutantData = {
  [P in PollutantType]?: number
}

type SummaryMeasurementPollutantDataDto = {
  [P in PollutantType]?: PollutantAverageDataDto<PollutantDataDto>
}

export type Coordinates = {
  longitude: number
  latitude: number
}

export type ForecastResponseDto = {
  base_time: string
  valid_time: string
  location_type: LocationType
  location: Coordinates
  location_name: string
  overall_aqi_level: number
} & ForecastPollutantDataDto

export type MeasurementsResponseDto = {
  measurement_date: string
  location_type: LocationType
  location_name: string
  location: Coordinates
  api_source: string
  entity: string
  sensor_type: string
  site_name: string
} & MeasurementPollutantData

export type MeasurementSummaryResponseDto = {
  measurement_base_time: string
  location_type: LocationType
  location_name: string
  overall_aqi_level: PollutantAverageDataDto<number>
} & SummaryMeasurementPollutantDataDto
