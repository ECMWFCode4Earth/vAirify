function createLiteralArray<T extends string>(...args: T[]): T[] {
  return args
}

export type PollutantType = 'no2' | 'o3' | 'pm2_5' | 'pm10' | 'so2'

export const pollutantTypes = createLiteralArray<PollutantType>(
  'pm2_5',
  'pm10',
  'no2',
  'o3',
  'so2',
)

export const pollutantTypeDisplay: Record<PollutantType, string> = {
  no2: 'Nitrogen Dioxide',
  o3: 'Ozone',
  pm2_5: 'PM2.5',
  pm10: 'PM10',
  so2: 'Sulphur Dioxide',
}

export type LocationType = 'city'
