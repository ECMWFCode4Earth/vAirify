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
  maxForecastDate: DateTime
}

const ForecastContext = createContext<ForecastContextType | undefined>(
  undefined,
)

// eslint-disable-next-line react-refresh/only-export-components
export const useForecastContext = () =>
  useContext(ForecastContext) as ForecastContextType

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ForecastContextProvider = (props: any) => {
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
    forecastBaseDate.plus({ days: 5 }),
  )

  const maxForecastDate: ForecastContextType['maxForecastDate'] =
    forecastBaseDate.plus({ days: 5 })

  return (
    <ForecastContext.Provider
      value={{
        forecastBaseDate,
        setForecastBaseDate,
        maxInSituDate,
        maxForecastDate,
      }}
    >
      {props.children}
    </ForecastContext.Provider>
  )
}
