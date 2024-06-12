import { DateTime } from 'luxon'

import { getMeasurementSummary } from './measurement-data-service'

describe('Measurement Data Service', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      } as unknown as Response),
    )
  })
  it('should getMeasurementSummary with defaults', async () => {
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
  it('should getMeasurementSummary with supplied params', async () => {
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
