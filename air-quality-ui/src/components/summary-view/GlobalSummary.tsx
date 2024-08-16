import { useQueries, useQuery } from '@tanstack/react-query'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { DateTime } from 'luxon'
import { useCallback, useMemo, useState } from 'react'

import classes from './GlobalSummary.module.css'
import { SummaryViewHeader } from './SummaryViewHeader'
import { useForecastContext } from '../../context'
import { getForecastData } from '../../services/forecast-data-service'
import { getValidForecastTimesBetween } from '../../services/forecast-time-service'
import { getMeasurementSummary } from '../../services/measurement-data-service'
import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../../services/types'
import { LoadingSpinner } from '../common/LoadingSpinner'
import GlobalSummaryTable from '../summary-grid/table/GlobalSummaryTable'

const GlobalSummary = (): JSX.Element => {
  const { forecastBaseDate, maxInSituDate } = useForecastContext()
  const [showAllColoured, setShowAllColoured] = useState<boolean>(true)

  const wrapSetShowAllColoured = useCallback(
    (val: boolean) => {
      setShowAllColoured(val)
    },
    [setShowAllColoured],
  )

  const {
    data: forecastData,
    isPending: forecastPending,
    isError: forecastDataError,
  } = useQuery({
    queryKey: [forecastBaseDate, maxInSituDate],
    queryFn: () =>
      getForecastData(forecastBaseDate, DateTime.now(), forecastBaseDate).then(
        (forecastData) =>
          forecastData.reduce<Record<string, ForecastResponseDto[]>>(
            (acc, reading) => {
              const location = reading.location_name
              if (!acc[location]) {
                acc[location] = []
              }
              acc[location].push(reading)
              return acc
            },
            {},
          ),
      ),
  })

  const forecastValidTimeRange = useMemo(() => {
    return getValidForecastTimesBetween(forecastBaseDate, maxInSituDate)
  }, [forecastBaseDate, maxInSituDate])

  const {
    data: summarizedMeasurementData,
    isPending: summaryPending,
    isError: summaryDataError,
  } = useQueries({
    queries: forecastValidTimeRange.map((validTime) => ({
      queryKey: ['summary', validTime.toMillis(), maxInSituDate],
      queryFn: () => getMeasurementSummary(validTime),
    })),
    combine: (results) => {
      const measurementsByLocation = results
        .flatMap(({ data }) => data)
        .reduce<Record<string, MeasurementSummaryResponseDto[]>>(
          (acc, measurement) => {
            if (measurement) {
              const locationName = measurement.location_name
              if (!acc[locationName]) {
                acc[locationName] = []
              }
              acc[locationName].push(measurement)
            }
            return acc
          },
          {},
        )
      return { data: measurementsByLocation, isError: false, isPending: false }
    },
  })

  if (forecastDataError || summaryDataError) {
    return <span>Error occurred</span>
  }
  return (
    <>
      {(forecastPending || summaryPending) && (
        <span className={classes['loading-container']}>
          <LoadingSpinner />
        </span>
      )}
      {!forecastPending && !summaryPending && (
        <div className={classes['summary-container']}>
          <SummaryViewHeader
            setShowAllColoured={wrapSetShowAllColoured}
            showAllColoured={showAllColoured}
          />
          <GlobalSummaryTable
            forecast={forecastData}
            summarizedMeasurements={summarizedMeasurementData}
            showAllColoured={showAllColoured}
          />
        </div>
      )}
    </>
  )
}

export default GlobalSummary
