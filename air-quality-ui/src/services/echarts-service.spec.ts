import { convertToLocalTime } from './echarts-service'

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
})
