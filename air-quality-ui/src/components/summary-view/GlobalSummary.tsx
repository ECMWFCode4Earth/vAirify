import { useQueries } from '@tanstack/react-query'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { useState } from 'react'

import classes from './GlobalSummary.module.css'
import { combineApiResult } from './summary-data-mapper'
import { getForecastData } from '../../services/forecast-data-service'
import {
  getLatestBaseForecastTime,
  getLatestValidForecastTime,
} from '../../services/forecast-time-service'
import { getMeasurementSummary } from '../../services/measurement-data-service'
import GlobalSummaryTable from '../summary-grid/GlobalSummaryTable'

const GlobalSummary = (): JSX.Element => {
  const [latestForecastDate] = useState(getLatestBaseForecastTime())
  const [latestValidDate] = useState(getLatestValidForecastTime())

  const { data, isError } = useQueries({
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
    combine: (result) => combineApiResult(result),
  })

  if (isError) {
    return <span>Error occurred</span>
  }
  return (
    <div className={classes['summary-container']}>
      <div>
        <div>
          Forecast Base Time:{' '}
          {latestForecastDate.toFormat('yyyy-MM-dd HH:mm ZZZZ')}
        </div>
        <div>
          Forecast Valid Time:{' '}
          {latestValidDate.toFormat('yyyy-MM-dd HH:mm ZZZZ')}
        </div>
      </div>
      <GlobalSummaryTable
        forecast={data.forecast}
        summarizedMeasurements={data.summarizedMeasurements}
      />
    </div>
  )
}

export default GlobalSummary
