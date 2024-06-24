import { createContext } from 'react'

import { getLatestBaseForecastTime } from './services/forecast-time-service'

export const ForecastContext = createContext(
  getLatestBaseForecastTime().minus({ hours: 24 }),
)
