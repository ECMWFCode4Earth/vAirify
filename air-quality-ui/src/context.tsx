import { DateTime } from 'luxon'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import {
  getLatestBaseForecastTime,
  getNearestValidForecastTime,
} from './services/forecast-time-service'

type ForecastWindowDetails = {
  forecastBaseDate: DateTime
  maxForecastDate: DateTime
  maxMeasurementDate: DateTime
  forecastWindow: number
}

export type SetForcastDetailsType = {
  forecastBaseDate: DateTime
  forecastWindow: number
}

type ForecastDetailsContext = {
  setDetails: (newDetails: SetForcastDetailsType) => void
  forecastDetails: ForecastWindowDetails
}

const defaultForecastBaseDate = getLatestBaseForecastTime()

const defaultValue: ForecastWindowDetails = {
  forecastBaseDate: defaultForecastBaseDate.minus({ hours: 24 }),
  maxForecastDate: defaultForecastBaseDate,
  maxMeasurementDate: DateTime.min(
    getNearestValidForecastTime(DateTime.utc()),
    defaultForecastBaseDate,
  ),
  forecastWindow: 1,
}

const ForecastContext = createContext<ForecastDetailsContext>({
  setDetails: () => {},
  forecastDetails: defaultValue,
})

// eslint-disable-next-line react-refresh/only-export-components
export const useForecastContext = () => useContext(ForecastContext)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ForecastContextProvider = (props: any) => {
  const [forecastDetails, setForecastDetails] =
    useState<ForecastWindowDetails>(defaultValue)

  const setDetails = useCallback((response: SetForcastDetailsType) => {
    setForecastDetails({
      maxForecastDate: response.forecastBaseDate.plus({
        days: response.forecastWindow,
      }),
      maxMeasurementDate: DateTime.min(
        getNearestValidForecastTime(DateTime.utc()),
        response.forecastBaseDate.plus({ days: response.forecastWindow }),
      ),
      ...response,
    })
  }, [])

  const contextValue = useMemo(
    () => ({
      setDetails,
      forecastDetails,
    }),
    [setDetails, forecastDetails],
  )

  return (
    <ForecastContext.Provider value={contextValue}>
      {props.children}
    </ForecastContext.Provider>
  )
}
