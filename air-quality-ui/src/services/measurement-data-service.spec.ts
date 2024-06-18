import { DateTime } from 'luxon'

import {
  getMeasurementSummary,
  getMeasurements,
} from './measurement-data-service'

describe('Measurement Data Service', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      } as unknown as Response),
    )
  })
  describe('getMeasurementSummary', () => {
    it('with defaults', async () => {
      const base = DateTime.fromObject(
        { year: 2024, month: 1, day: 3, hour: 12, minute: 0, second: 0 },
        { zone: 'UTC' },
      )

      const result = await getMeasurementSummary(base)

      expect(result).toEqual([])
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/air-pollutant/measurements/summary' +
          '?measurement_base_time=2024-01-03T12%3A00%3A00.000Z' +
          '&measurement_time_range=90' +
          '&location_type=city',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    })
    it('with supplied params', async () => {
      const base = DateTime.fromObject(
        { year: 2024, month: 1, day: 3, hour: 12, minute: 0, second: 0 },
        { zone: 'UTC' },
      )

      const result = await getMeasurementSummary(base, 1)

      expect(result).toEqual([])
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/air-pollutant/measurements/summary' +
          '?measurement_base_time=2024-01-03T12%3A00%3A00.000Z' +
          '&measurement_time_range=1' +
          '&location_type=city',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    })
  })
  describe('getMeasurements', () => {
    const dateFrom = DateTime.fromObject(
      { year: 2024, month: 1, day: 3, hour: 12, minute: 0, second: 0 },
      { zone: 'UTC' },
    )
    const dateTo = DateTime.fromObject(
      { year: 2024, month: 1, day: 4, hour: 12, minute: 0, second: 0 },
      { zone: 'UTC' },
    )
    it('with defaults', async () => {
      const result = await getMeasurements(dateFrom, dateTo)

      expect(result).toEqual([])
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.com/air-pollutant/measurements' +
          '?date_from=2024-01-03T12%3A00%3A00.000Z' +
          '&date_to=2024-01-04T12%3A00%3A00.000Z' +
          '&location_type=city',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    })
    it('adds location names correctly', async () => {
      const result = await getMeasurements(dateFrom, dateTo, 'city', [
        'London',
        'Paris',
      ])

      expect(result).toEqual([])
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching('&location_name=London&location_name=Paris'),
        expect.anything(),
      )
    })
    it('adds api source correctly', async () => {
      const result = await getMeasurements(
        dateFrom,
        dateTo,
        'city',
        [],
        'source',
      )

      expect(result).toEqual([])
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching('&api_source=source'),
        expect.anything(),
      )
    })
  })
})
