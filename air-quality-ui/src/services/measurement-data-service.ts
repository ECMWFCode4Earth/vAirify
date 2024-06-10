import { DateTime } from 'luxon'

import { MeasurementSummaryResponseDto } from './types'
import { LocationType } from '../models'

const API_URL = import.meta.env.VITE_AIR_QUALITY_API_URL

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
  const url = new URL(`${API_URL}/air-pollutant/measurements/summary`)
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key]),
  )

  return fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json())
}
