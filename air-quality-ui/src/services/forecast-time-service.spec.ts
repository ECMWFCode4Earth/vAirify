import { DateTime } from 'luxon'

import {
  getInSituPercentage,
  getLatestBaseForecastTime,
  getValidForecastTimesBetween,
} from './forecast-time-service'

describe('Forecast Time Service', () => {
  it.each([
    [
      DateTime.fromISO('2024-06-11T09:59:00Z'),
      DateTime.fromISO('2024-06-10T12:00:00Z'),
    ],
    [
      DateTime.fromISO('2024-06-11T10:00:00Z'),
      DateTime.fromISO('2024-06-11T00:00:00Z'),
    ],
    [
      DateTime.fromISO('2024-06-11T22:00:00Z'),
      DateTime.fromISO('2024-06-11T12:00:00Z'),
    ],
    [
      DateTime.fromISO('2024-06-11T11:00:00+01:00'),
      DateTime.fromISO('2024-06-11T00:00:00Z'),
    ],
    [
      DateTime.fromISO('2024-06-11T09:00:00-01:00'),
      DateTime.fromISO('2024-06-11T00:00:00Z'),
    ],
  ])('should get the latest base forecast time from %s', (from, expected) => {
    expect(from.isValid).toBe(true)
    if (from.isValid) {
      expect(getLatestBaseForecastTime(from).toMillis()).toEqual(
        expected.toMillis(),
      )
    }
  })

  it.each([
    [
      DateTime.fromISO('2024-06-11T00:00:00', { zone: 'utc' }),
      DateTime.fromISO('2024-06-11T06:00:00', { zone: 'utc' }),
      [
        DateTime.fromISO('2024-06-11T00:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-11T03:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-11T06:00:00', { zone: 'utc' }),
      ],
    ],
    [
      DateTime.fromISO('2024-06-11T21:00:00', { zone: 'utc' }),
      DateTime.fromISO('2024-06-12T03:00:00', { zone: 'utc' }),
      [
        DateTime.fromISO('2024-06-11T21:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-12T00:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-12T03:00:00', { zone: 'utc' }),
      ],
    ],
    [
      DateTime.fromISO('2024-06-11T01:00:00', { zone: 'utc' }),
      DateTime.fromISO('2024-06-11T10:00:00', { zone: 'utc' }),
      [
        DateTime.fromISO('2024-06-11T00:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-11T03:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-11T06:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-11T09:00:00', { zone: 'utc' }),
      ],
    ],
  ])(
    'should get the nearest valid forecast time ranges from %s',
    (from, end, expected) => {
      expect(from.isValid).toBe(true)
      expect(end.isValid).toBe(true)
      if (from.isValid && end.isValid) {
        expect(getValidForecastTimesBetween(from, end)).toEqual(expected)
      }
    },
  )
  describe('getInSituPercentage', () => {
    it.each([
      [
        DateTime.fromISO('2024-06-01T00:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-05T00:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-05T00:00:00', { zone: 'utc' }),
        100,
      ],
      [
        DateTime.fromISO('2024-06-01T00:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-05T00:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-01T00:00:00', { zone: 'utc' }),
        0,
      ],
      [
        DateTime.fromISO('2024-06-01T00:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-05T00:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-03T00:00:00', { zone: 'utc' }),
        50,
      ],
    ])(
      'should calculate correct percentage',
      (baseForecastDate, maxForecastDate, maxInSituDate, expectedPercent) => {
        expect(
          getInSituPercentage(baseForecastDate, maxForecastDate, maxInSituDate),
        ).toBe(expectedPercent)
      },
    )
  })
})
