import { DateTime } from 'luxon'
import { createContext, useContext, useState } from 'react'

import {
  getLatestBaseForecastTime,
  getNearestValidForecastTime,
} from './services/forecast-time-service'

type ForecastContextType = {
  forecastBaseDate: DateTime
  setForecastBaseDate: (arg: DateTime) => void
  maxInSituDate: DateTime
}

const ForecastContext = createContext<ForecastContextType | undefined>(
  undefined,
)

export const useForecastContext = () =>
  useContext(ForecastContext) as ForecastContextType

export const ForecastContextProvider = (props) => {
  const defaultValue = getLatestBaseForecastTime().minus({ hours: 24 })

  const [forecastBaseDate, setForecastBaseDateState] =
    useState<ForecastContextType['forecastBaseDate']>(defaultValue)
  const setForecastBaseDate: ForecastContextType['setForecastBaseDate'] = (
    value,
  ) => {
    setForecastBaseDateState(value)
  }
  const maxInSituDate: ForecastContextType['maxInSituDate'] = DateTime.min(
    getNearestValidForecastTime(DateTime.utc()),
    forecastBaseDate.plus({ days: 3 }),
  )

  return (
    <ForecastContext.Provider
      value={{ forecastBaseDate, setForecastBaseDate, maxInSituDate }}
    >
      {props.children}
    </ForecastContext.Provider>
  )
}
