import each from 'jest-each'

import { getPollutantIndexLevel } from './CalculateAQI'

each([
  [12, 'o3', 1],
  [51, 'o3', 2],
  [101, 'o3', 3],
  [131, 'o3', 4],
  [241, 'o3', 5],
  [381, 'o3', 6],

  [1, 'no2', 1],
  [41, 'no2', 2],
  [91, 'no2', 3],
  [121, 'no2', 4],
  [231, 'no2', 5],
  [341, 'no2', 6],

  [10, 'so2', 1],
  [110, 'so2', 2],
  [250, 'so2', 3],
  [351, 'so2', 4],
  [550, 'so2', 5],
  [1200, 'so2', 6],

  [12, 'pm10', 1],
  [21, 'pm10', 2],
  [41, 'pm10', 3],
  [51, 'pm10', 4],
  [101, 'pm10', 5],
  [151, 'pm10', 6],

  [5, 'pm2_5', 1],
  [11, 'pm2_5', 2],
  [21, 'pm2_5', 3],
  [26, 'pm2_5', 4],
  [51, 'pm2_5', 5],
  [76, 'pm2_5', 6],
]).describe(
  'Calculate AQI',
  (pollutantValue: number, pollutantType: string, expected: number) => {
    it(`should output AQI(${expected}) based on the value of the pollutant(${pollutantValue}) and pollutant type(${pollutantType})`, () => {
      expect(getPollutantIndexLevel(pollutantValue, pollutantType)).toEqual(
        expected,
      )
    })
  },
)
