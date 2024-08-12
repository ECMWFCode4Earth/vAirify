import { DateTime } from 'luxon'
import { createContext, useContext, useState } from 'react'

import {
  getLatestBaseForecastTime,
  getNearestValidForecastTime,
} from './services/forecast-time-service'

type ForecastContextType = {
  forecastBaseDate: DateTime
  maxForecastDate: DateTime
  maxInSituDate: DateTime
  setForecastBaseDate: (arg: DateTime) => void
  setMaxForecastDate: (arg: number) => void
  setMaxInSituDate: (arg: number) => void
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

  const [maxForecastDate, setMaxForecastDateState] = useState<
    ForecastContextType['maxForecastDate']
  >(forecastBaseDate.plus({ days: 1 }))

  const [maxInSituDate, setMaxInSituDateState] = useState<
    ForecastContextType['maxInSituDate']
  >(
    DateTime.min(
      getNearestValidForecastTime(DateTime.utc()),
      forecastBaseDate.plus({ days: 1 }),
    ),
  )

  const setForecastBaseDate: ForecastContextType['setForecastBaseDate'] = (
    value,
  ) => {
    setForecastBaseDateState(value)
  }
  const setMaxForecastDate: ForecastContextType['setMaxForecastDate'] = (
    value,
  ) => {
    setMaxForecastDateState(forecastBaseDate.plus({ days: value }))
  }

  const setMaxInSituDate: ForecastContextType['setMaxInSituDate'] = (value) => {
    setMaxInSituDateState(
      DateTime.min(
        getNearestValidForecastTime(DateTime.utc()),
        forecastBaseDate.plus({ days: value }),
      ),
    )
  }

  return (
    <ForecastContext.Provider
      value={{
        forecastBaseDate,
        maxForecastDate,
        maxInSituDate,
        setForecastBaseDate,
        setMaxInSituDate,
        setMaxForecastDate,
      }}
    >
      {props.children}
    </ForecastContext.Provider>
  )
}
