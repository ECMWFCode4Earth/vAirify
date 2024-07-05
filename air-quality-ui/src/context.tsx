import { DateTime } from 'luxon'
import { createContext, useContext, useState } from 'react'

import { getLatestBaseForecastTime } from './services/forecast-time-service'

type ForecastContextType = {
  forecastBaseDate: DateTime
  setForecastBaseDate: (arg: DateTime) => void
}

const ForecastContext = createContext<ForecastContextType | undefined>(
  undefined,
)

// forecastContextBaseTime: getLatestBaseForecastTime().minus({ hours: 24 })

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

  return (
    <ForecastContext.Provider value={{ forecastBaseDate, setForecastBaseDate }}>
      {props.children}
    </ForecastContext.Provider>
  )
}
