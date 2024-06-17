import { DateTime } from 'luxon'

import { fetchJson } from './fetch-common'
import { ForecastResponseDto } from './types'
import { LocationType } from '../models'

const API_URL = import.meta.env.VITE_AIR_QUALITY_API_URL

export const getForecastData = async (
  dateFrom: DateTime,
  dateTo: DateTime,
  baseTime: DateTime,
  locationType: LocationType = 'city',
): Promise<ForecastResponseDto[]> => {
  const params: Record<string, string> = {
    location_type: locationType,
    valid_time_from: dateFrom.toJSDate().toISOString(),
    valid_time_to: dateTo.toJSDate().toISOString(),
    base_time: baseTime.toJSDate().toISOString(),
  }
  return fetchJson(`${API_URL}/air-pollutant/forecast`, params)
}
