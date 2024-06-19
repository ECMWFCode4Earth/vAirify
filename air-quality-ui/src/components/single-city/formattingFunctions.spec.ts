import { toolTipFormat, xAxisFormat } from './formattingFunctions'

describe('Formatting Functions', () => {
  it('should xAxisFormat display full date 2024-06-13 12:00 if first index', async () => {
    const result = xAxisFormat('2024-06-14T12:00:00.000+00:00', 0)

    expect(result).toEqual('2024-06-14 12:00')
  })
  it('should xAxisFormat display time only 12:00 if beyond first index', async () => {
    const result = xAxisFormat('2024-06-14T03:00:00.000+00:00', 1)

    expect(result).toEqual('03:00')
  })
  it('should xAxisFormat display full date if time is 00:00 if beyond first index', async () => {
    const result = xAxisFormat('2024-06-14T00:00:00.000+00:00', 8)

    expect(result).toEqual('2024-06-14 00:00')
  })

  it('should toolTipFormat display tool tip, showing time and aqi value', async () => {
    const result = toolTipFormat({
      value: ['2024-06-14T00:00:00.000+00:00', 3],
    })

    expect(result).toEqual('x: 2024-06-14 00:00, y: 3')
  })
})
