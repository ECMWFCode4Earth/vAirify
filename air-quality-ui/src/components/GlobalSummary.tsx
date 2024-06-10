import { useQueries } from '@tanstack/react-query'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { useState } from 'react'

import classes from './GlobalSummary.module.css'
import GlobalSummaryTable from './GlobalSummaryTable'
import { getForecastData } from '../api/forecast-api'
import { getMeasurementSummary } from '../api/measurement-api'
import {
  getLatestBaseForecastTime,
  getLatestValidForecastTime,
} from '../services/forecast-time-service'

const GlobalSummary = (): JSX.Element => {
  const [latestForecastDate] = useState(getLatestBaseForecastTime())
  const [latestValidDate] = useState(getLatestValidForecastTime())

  const { data, isPending, isError } = useQueries({
    queries: [
      {
        queryKey: ['forecast'],
        queryFn: () =>
          getForecastData(latestValidDate, latestValidDate, latestForecastDate),
      },
      {
        queryKey: ['summary'],
        queryFn: () => getMeasurementSummary(latestValidDate),
      },
    ],
    combine: ([forecast, summarizedMeasurements]) => {
      return {
        data: {
          forecast: forecast.data,
          summarizedMeasurements: summarizedMeasurements.data,
        },
        isPending: forecast.isPending || summarizedMeasurements.isPending,
        isError: forecast.isError || summarizedMeasurements.isError,
      }
    },
  })

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error occurred</span>
  }
  return (
    <div className={classes['summary-container']}>
      <div>
        <div>
          <label>Forecast Base Time</label>:{' '}
          {latestForecastDate.toFormat('yyyy-MM-dd HH:mm')}
        </div>
        <div>
          <label>Forecast Valid Time</label>:{' '}
          {latestValidDate.toFormat('yyyy-MM-dd HH:mm')}{' '}
        </div>
      </div>
      <GlobalSummaryTable
        forecast={data.forecast ?? []}
        summarizedMeasurements={data.summarizedMeasurements ?? []}
      />
    </div>
  )
}

export default GlobalSummary
