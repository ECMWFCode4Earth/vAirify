import { DateTime } from 'luxon'

import { convertToLocalTime, textToColor, xAxisFormat } from './echarts-service'

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
    it('should display full date 2024-06-13 12:00 if first index', async () => {
      const result = xAxisFormat(
        DateTime.fromISO('2024-06-14T12:00:00.000+00:00').toMillis(),
        0,
      )
      expect(result).toEqual('14/06')
    })
    it('should display time only 12:00 if beyond first index', async () => {
      const result = xAxisFormat(
        DateTime.fromISO('2024-06-14T03:00:00.000').toMillis(),
        1,
      )
      expect(result).toEqual('03:00')
    })
    it('should display full date if time is 00:00 if beyond first index', async () => {
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
})
