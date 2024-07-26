import { DateTime } from 'luxon'

import { fetchJson } from './fetch-common'
import { MeasurementSummaryResponseDto, MeasurementsResponseDto } from './types'
import { LocationType } from '../models'

const API_URL = import.meta.env.VITE_AIR_QUALITY_API_URL

const queryMeasurements = async (
  urlString: string,
  params: Record<string, string | string[]>,
) => {
  return fetchJson(`${API_URL}/air-pollutant${urlString}`, params)
}

export const getMeasurements = async (
  dateFrom: DateTime,
  dateTo: DateTime,
  locationType: LocationType = 'city',
  locations?: string[],
  apiSource?: string,
): Promise<MeasurementsResponseDto[]> => {
  const params: Record<string, string | string[]> = {
    date_from: dateFrom.toJSDate().toISOString(),
    date_to: dateTo.toJSDate().toISOString(),
    location_type: locationType,
  }
  if (locations) {
    params['location_names'] = locations
  }
  if (apiSource) {
    params['api_source'] = apiSource
  }
  return queryMeasurements('/measurements', params)
}

export const getMeasurementSummary = async (
  baseTime: DateTime,
  rangeInMinutes = 90,
  locationType: LocationType = 'city',
): Promise<MeasurementSummaryResponseDto[]> => {
  const params: Record<string, string> = {
    measurement_base_time: baseTime.toJSDate().toISOString(),
    measurement_time_range: `${rangeInMinutes}`,
    location_type: locationType,
  }
  return queryMeasurements('/measurements/summary', params)
}
