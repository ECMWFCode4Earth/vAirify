import { DateTime } from 'luxon'

import { getForecastData } from './forecast-data-service'

describe('Forecast Data Service', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      } as unknown as Response),
    )
  })
  it('should getForecastData for city by default', async () => {
    const dateFrom = DateTime.fromObject(
      { year: 2024, month: 1, day: 1, hour: 12, minute: 0, second: 0 },
      { zone: 'UTC' },
    )

    const dateTo = DateTime.fromObject(
      { year: 2024, month: 1, day: 5, hour: 12, minute: 0, second: 0 },
      { zone: 'UTC' },
    )

    const base = DateTime.fromObject(
      { year: 2024, month: 1, day: 3, hour: 12, minute: 0, second: 0 },
      { zone: 'UTC' },
    )

    const result = await getForecastData(dateFrom, dateTo, base)

    expect(result).toEqual([])
    expect(global.fetch).toHaveBeenCalledWith(
      'https://test.com/air-pollutant/forecast' +
        '?location_type=city' +
        '&valid_time_from=2024-01-01T12%3A00%3A00.000Z' +
        '&valid_time_to=2024-01-05T12%3A00%3A00.000Z' +
        '&base_time=2024-01-03T12%3A00%3A00.000Z',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  })
})
