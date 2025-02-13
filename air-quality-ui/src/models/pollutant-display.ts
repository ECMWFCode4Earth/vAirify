import { PollutantType } from './types'

export const pollutantTypeDisplay: Record<PollutantType, string> = {
  pm2_5: 'PM2.5 (µg/m³)',
  pm10: 'PM10 (µg/m³)',
  no2: 'NO2 (µg/m³)',
  o3: 'O3 (µg/m³)',
  so2: 'SO2 (µg/m³)'
} 