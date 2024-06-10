function createLiteralArray<T extends string>(...args: T[]): T[] {
  return args
}

export type PollutantType = 'no2' | 'o3' | 'pm2_5' | 'pm10' | 'so2'

export const pollutantTypes = createLiteralArray<PollutantType>(
  'no2',
  'o3',
  'pm2_5',
  'pm10',
  'so2',
)

export type LocationType = 'city'
