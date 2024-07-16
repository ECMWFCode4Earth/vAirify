import getPollutantIndexLevel from './aqi-calculator-service'

describe('Aqi Calculator', () => {
  it.each([
    [1, 'o3', 1],
    [50, 'o3', 1],

    [51, 'o3', 2],
    [100, 'o3', 2],

    [101, 'o3', 3],
    [130, 'o3', 3],

    [131, 'o3', 4],
    [240, 'o3', 4],

    [241, 'o3', 5],
    [380, 'o3', 5],

    [381, 'o3', 6],
    [800, 'o3', 6],

    [1, 'no2', 1],
    [40, 'no2', 1],

    [41, 'no2', 2],
    [90, 'no2', 2],

    [91, 'no2', 3],
    [120, 'no2', 3],

    [121, 'no2', 4],
    [230, 'no2', 4],

    [231, 'no2', 5],
    [340, 'no2', 5],

    [341, 'no2', 6],
    [1000, 'no2', 6],

    [1, 'so2', 1],
    [100, 'so2', 1],

    [101, 'so2', 2],
    [200, 'so2', 2],

    [201, 'so2', 3],
    [350, 'so2', 3],

    [351, 'so2', 4],
    [500, 'so2', 4],

    [501, 'so2', 5],
    [750, 'so2', 5],

    [751, 'so2', 6],
    [1250, 'so2', 6],

    [1, 'pm10', 1],
    [20, 'pm10', 1],

    [21, 'pm10', 2],
    [40, 'pm10', 2],

    [41, 'pm10', 3],
    [50, 'pm10', 3],

    [51, 'pm10', 4],
    [100, 'pm10', 4],

    [101, 'pm10', 5],
    [150, 'pm10', 5],

    [151, 'pm10', 6],
    [1200, 'pm10', 6],

    [1, 'pm2_5', 1],
    [10, 'pm2_5', 1],

    [11, 'pm2_5', 2],
    [20, 'pm2_5', 2],

    [21, 'pm2_5', 3],
    [25, 'pm2_5', 3],

    [26, 'pm2_5', 4],
    [50, 'pm2_5', 4],

    [51, 'pm2_5', 5],
    [75, 'pm2_5', 5],

    [76, 'pm2_5', 6],
    [800, 'pm2_5', 6],
  ])(
    `If value is %d and pollutant type is %s return aqi value as %d`,
    (valueA, pollutantType, expected) => {
      const result = getPollutantIndexLevel(valueA, pollutantType)
      expect(result).toBe(expected)
    },
  )
})
