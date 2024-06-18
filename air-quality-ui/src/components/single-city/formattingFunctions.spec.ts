import { toolTipFormat, xAxisFormat } from './formattingFunctions'

describe('Formatting Functions', () => {
  it('should xAxisFormat display full date 2024-06-13 12:00 if first index', async () => {
    const result = xAxisFormat('1718280000000', 0)

    expect(result).toEqual('2024-06-13 12:00')
  })
  it('should xAxisFormat display time only 12:00 if beyond first index', async () => {
    const result = xAxisFormat('1718280000000', 1)

    expect(result).toEqual('12:00')
  })
  it('should xAxisFormat display full date if time is 00:00 if beyond first index', async () => {
    const result = xAxisFormat('1718496000000', 2)

    expect(result).toEqual('2024-06-16 00:00')
  })

  it('should toolTipFormat display tool tip, showing time and aqi value', async () => {
    const result = toolTipFormat({ value: ['1718496000000', 3] })

    expect(result).toEqual('x: 2024-06-16 00:00, y: 3')
  })
})
