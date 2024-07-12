import { DateTime } from 'luxon'

import {
  getInSituPercentage,
  getLatestBaseForecastTime,
  getNearestValidForecastTime,
  getValidForecastTimesBetween,
} from './forecast-time-service'

describe('Forecast Time Service', () => {
  describe('getLatestBaseForecastTime', () => {
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
    it('should use current time by default', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-06-20T12:34'))
      const response = getLatestBaseForecastTime().toMillis()
      const expected = DateTime.fromISO('2024-06-20T00:00:00Z').toMillis()
      expect(response).toEqual(expected)
    })
  })
  describe('getValidForecastTimesBetween', () => {
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
    it('should use current time for end date by default', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-06-20T11:34'))
      const startDate = DateTime.fromISO('2024-06-20T00:00:00Z')
      const response = getValidForecastTimesBetween(startDate)

      const expected = [
        DateTime.fromISO('2024-06-20T00:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-20T03:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-20T06:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-20T09:00:00', { zone: 'utc' }),
      ]
      expect(response).toEqual(expected)
    })
  })
  describe('getNearestValidForecastTime', () => {
    it.each([
      [
        DateTime.fromISO('2024-06-05T00:00:00', { zone: 'utc' }),
        DateTime.fromISO('2024-06-05T00:00:00', { zone: 'utc' }),
      ],
      [
        DateTime.fromISO('2024-06-05T12:34:56', { zone: 'utc' }),
        DateTime.fromISO('2024-06-05T12:00:00', { zone: 'utc' }),
      ],
      [
        DateTime.fromISO('2024-06-05T23:59:59', { zone: 'utc' }),
        DateTime.fromISO('2024-06-05T21:00:00', { zone: 'utc' }),
      ],
    ])('should retrieve correct time', (inputTime, expectedTime) => {
      expect(getNearestValidForecastTime(inputTime)).toEqual(expectedTime)
    })
  })
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
