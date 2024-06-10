import { DateTime } from 'luxon'

import { getForecastData } from './forecast-data-service'

describe('Forecast Data Service', () => {
  it('should getForecastData', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      } as unknown as Response),
    )

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
      'https://test.com/air-pollutant/forecast?location_type=city&valid_date_from=2024-01-01T12%3A00%3A00.000Z&valid_date_to=2024-01-05T12%3A00%3A00.000Z&forecast_base_time=2024-01-03T12%3A00%3A00.000Z',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  })
})
