import { DateTime } from 'luxon'

import {
  getLatestBaseForecastTime,
  getLatestValidForecastTime,
} from './forecast-time-service'

describe('Forecast Time Service', () => {
  it.each([
    [
      DateTime.fromISO('2024-06-11T09:59:00', { zone: 'utc' }),
      DateTime.fromISO('2024-06-10T12:00:00', { zone: 'utc' }),
    ],
    [
      DateTime.fromISO('2024-06-11T10:00:00', { zone: 'utc' }),
      DateTime.fromISO('2024-06-11T00:00:00', { zone: 'utc' }),
    ],
    [
      DateTime.fromISO('2024-06-11T22:00:00', { zone: 'utc' }),
      DateTime.fromISO('2024-06-11T12:00:00', { zone: 'utc' }),
    ],
    [
      DateTime.fromISO('2024-06-11T11:00:00', { zone: '+01:00' }),
      DateTime.fromISO('2024-06-11T00:00:00', { zone: 'utc' }),
    ],
    [
      DateTime.fromISO('2024-06-11T09:00:00', { zone: '-01:00' }),
      DateTime.fromISO('2024-06-11T00:00:00', { zone: 'utc' }),
    ],
  ])('should get the latest base forecast time from %s', (from, expected) => {
    if (from.isValid) {
      expect(getLatestBaseForecastTime(from)).toEqual(expected)
    }
  })

  it.each([
    [
      DateTime.fromISO('2024-06-11T09:00:00', { zone: 'utc' }),
      DateTime.fromISO('2024-06-11T06:00:00', { zone: 'utc' }),
    ],
    [
      DateTime.fromISO('2024-06-11T09:59:59', { zone: 'utc' }),
      DateTime.fromISO('2024-06-11T06:00:00', { zone: 'utc' }),
    ],
    [
      DateTime.fromISO('2024-06-11T10:00:00', { zone: 'utc' }),
      DateTime.fromISO('2024-06-11T09:00:00', { zone: 'utc' }),
    ],
    [
      DateTime.fromISO('2024-06-11T10:00:00', { zone: '+01:00' }),
      DateTime.fromISO('2024-06-11T06:00:00', { zone: 'utc' }),
    ],
    [
      DateTime.fromISO('2024-06-11T01:00:00', { zone: 'utc' }),
      DateTime.fromISO('2024-06-11T00:00:00', { zone: 'utc' }),
    ],
    [
      DateTime.fromISO('2024-06-11T00:00:00', { zone: 'utc' }),
      DateTime.fromISO('2024-06-10T21:00:00', { zone: 'utc' }),
    ],
  ])('should get the latest valid forecast time from %s', (from, expected) => {
    if (from.isValid) {
      expect(getLatestValidForecastTime(from)).toEqual(expected)
    }
  })
})
