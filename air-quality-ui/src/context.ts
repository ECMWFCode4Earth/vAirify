import { createContext } from 'react'

import {
  getLatestBaseForecastTime,
  getLatestValidForecastTime,
} from './services/forecast-time-service'

export const ForecastContext = createContext({
  forecastBaseTime: getLatestBaseForecastTime(),
  forecastValidTime: getLatestValidForecastTime(),
})
