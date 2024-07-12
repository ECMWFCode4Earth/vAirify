import getPollutantIndexLevel from './aqi-calculator-service'

describe('Aqi Calculator', () => {
  it.each([
    [10, 'o3', 1],
    [51, 'o3', 2],
    [101, 'o3', 3],
    [131, 'o3', 4],
    [241, 'o3', 5],
    [381, 'o3', 6],

    [10, 'no2', 1],
    [41, 'no2', 2],
    [91, 'no2', 3],
    [121, 'no2', 4],
    [231, 'no2', 5],
    [341, 'no2', 6],

    [10, 'so2', 1],
    [101, 'so2', 2],
    [201, 'so2', 3],
    [351, 'so2', 4],
    [501, 'so2', 5],
    [751, 'so2', 6],

    [10, 'pm10', 1],
    [21, 'pm10', 2],
    [41, 'pm10', 3],
    [51, 'pm10', 4],
    [101, 'pm10', 5],
    [151, 'pm10', 6],

    [5, 'pm2_5', 1],
    [19, 'pm2_5', 2],
    [21, 'pm2_5', 3],
    [26, 'pm2_5', 4],
    [51, 'pm2_5', 5],
    [76, 'pm2_5', 6],
  ])(`If comparing %s and %s, return %d`, (valueA, pollutantType, expected) => {
    const result = getPollutantIndexLevel(valueA, pollutantType)
    expect(result).toBe(expected)
  })
})
