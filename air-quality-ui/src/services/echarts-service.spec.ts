import { EChartsType } from 'echarts'
import { DateTime } from 'luxon'

import {
  convertToLocalTime,
  createSubtext,
  formatDateRange,
  textToColor,
  updateChartSubtext,
  xAxisFormat,
} from './echarts-service'

const originalDateResolvedOptions = new Intl.DateTimeFormat().resolvedOptions()
jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
  ...originalDateResolvedOptions,
  timeZone: 'EST',
})

describe('ECharts Service', () => {
  it("should convert a UTC date to user's local time", () => {
    expect(convertToLocalTime('2024-01-01T00:00:00Z')).toEqual(
      '2024-01-01T00:00:00.000-05:00',
    )
  })
  describe('xAxisFormat', () => {
    it('should display date without time (14/06) if first index', async () => {
      const result = xAxisFormat(
        DateTime.fromISO('2024-06-14T12:00:00.000+00:00').toMillis(),
        0,
      )
      expect(result).toEqual('14/06')
    })
    it('should display time only time if beyond first index', async () => {
      const result = xAxisFormat(
        DateTime.fromISO('2024-06-14T03:00:00.000').toMillis(),
        1,
      )
      expect(result).toEqual('03:00')
    })
    it('should display date without time at start of day if beyond first index', async () => {
      const result = xAxisFormat(
        DateTime.fromISO('2024-06-14T00:00:00.000').toMillis(),
        8,
      )
      expect(result).toEqual('14/06')
    })
  })
  describe('textToColor', () => {
    it('should produce the same unique color for a string', async () => {
      const location = 'testLocation'
      const firstResult = await textToColor(location)
      const secondResult = await textToColor(location)
      expect(firstResult).toEqual(secondResult)
    })
    it('should produce a different color for different strings', async () => {
      const firstResult = await textToColor('testLocation')
      const secondResult = await textToColor('testLocation2')
      expect(firstResult).not.toEqual(secondResult)
    })
    it('should produce a color in hex format', async () => {
      const location = 'testLocation'
      const result = await textToColor(location)
      expect(result).toMatch(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/)
    })
  })
  describe('dateFormat', () => {
    it('should format the dates correctly', () => {
      const start = DateTime.fromISO('2024-01-30T09:00')
      const end = DateTime.fromISO('2024-02-01T13:00')

      const result = formatDateRange(start, end)
      expect(result).toBe('30/01/2024 09:00 to 01/02/2024 13:00')
    })
  })

  describe('create subtext', () => {
    it('create correct string', () => {
      const start = DateTime.fromISO('2020-01-24T09:00')
      const end = DateTime.fromISO('2020-03-19T14:00')
      const forecast = DateTime.fromISO('2021-12-23T12:00')
      const result = createSubtext(forecast, start, end)

      expect(result).toBe(
        'Forecast: 23/12/2021 12:00 \n Range: 24/01/2020 09:00 to 19/03/2020 14:00',
      )
    })
  })

  describe('chart subtext', () => {
    it('updates the chart subtext with correct string', () => {
      const start = DateTime.fromISO('2020-01-24T09:00')
      const end = DateTime.fromISO('2020-03-19T14:00')
      const forecast = DateTime.fromISO('2021-12-23T12:00')
      const expectedDateString = createSubtext(forecast, start, end)
      const mockSetOption = jest.fn()
      const mockEchart = {
        setOption: mockSetOption,
        getOption: jest.fn(() => ({
          dataZoom: [
            { startValue: start.toMillis(), endValue: end.toMillis() },
          ],
        })),
      }

      updateChartSubtext(mockEchart as unknown as EChartsType, forecast)
      expect(mockSetOption).toHaveBeenCalledWith({
        title: { subtext: expectedDateString },
      })
    })
  })
})
