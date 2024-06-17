import { useQueries } from '@tanstack/react-query'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { useContext } from 'react'

import classes from './GlobalSummary.module.css'
import { combineApiResult } from './summary-data-mapper'
import { ForecastContext } from '../../context'
import { getForecastData } from '../../services/forecast-data-service'
import { getMeasurementSummary } from '../../services/measurement-data-service'
import GlobalSummaryTable from '../summary-grid/GlobalSummaryTable'

const GlobalSummary = (): JSX.Element => {
  const { forecastBaseTime, forecastValidTime } = useContext(ForecastContext)

  const { data, isError } = useQueries({
    queries: [
      {
        queryKey: ['forecast'],
        queryFn: () =>
          getForecastData(
            forecastValidTime,
            forecastValidTime,
            forecastBaseTime,
          ),
      },
      {
        queryKey: ['summary'],
        queryFn: () => getMeasurementSummary(forecastValidTime),
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
          {forecastBaseTime.toFormat('yyyy-MM-dd HH:mm ZZZZ')}
        </div>
        <div>
          Forecast Valid Time:{' '}
          {forecastValidTime.toFormat('yyyy-MM-dd HH:mm ZZZZ')}
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
