import { useQueries, useQuery } from '@tanstack/react-query'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import Switch from 'react-switch'

import classes from './GlobalSummary.module.css'
import { useForecastContext } from '../../context'
import { getForecastData } from '../../services/forecast-data-service'
import { getValidForecastTimesBetween } from '../../services/forecast-time-service'
import { getMeasurementSummary } from '../../services/measurement-data-service'
import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../../services/types'
import GlobalSummaryTable from '../summary-grid/table/GlobalSummaryTable'

const GlobalSummary = (): JSX.Element => {
  const { forecastBaseDate: forecastBaseTime } = useForecastContext()
  const [showAllColoured, setShowAllColoured] = useState<boolean>(true)

  const { data: forecastData, isError: forecastDataError } = useQuery({
    queryKey: ['forecast'],
    queryFn: () =>
      getForecastData(forecastBaseTime, DateTime.now(), forecastBaseTime).then(
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

  const forecastValidTimeRange = useMemo(
    () => getValidForecastTimesBetween(forecastBaseTime),
    [forecastBaseTime],
  )

  const { data: summarizedMeasurementData, isError: summaryDataError } =
    useQueries({
      queries: forecastValidTimeRange.map((validTime) => ({
        queryKey: ['summary', validTime.toMillis()],
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
        return { data: measurementsByLocation, isError: false }
      },
    })

  if (forecastDataError || summaryDataError) {
    return <span>Error occurred</span>
  }
  return (
    <div>
      <div className={`ag-theme-quartz ${classes['switch-div']}`}>
        <label className={`ag-theme-quartz ${classes['switch-label']}`}>
          {showAllColoured
            ? 'Highlight all AQI values'
            : 'Highlight primary AQI values'}
        </label>
        <Switch
          data-testid="aqi-highlight-switch"
          onChange={() => {
            if (showAllColoured) setShowAllColoured(false)
            else setShowAllColoured(true)
          }}
          checked={showAllColoured}
        />
      </div>
      <div className={classes['summary-container']}>
        <div>
          <div>
            Forecast Base Time: {forecastBaseTime.toFormat('dd MMM HH:mm ZZZZ')}
          </div>
          <div data-testid="forecast-valid-range">
            Forecast Valid Time Range:{' '}
            {forecastBaseTime.toFormat('dd MMM HH:mm')} -{' '}
            {forecastValidTimeRange.slice(-1)[0]?.toFormat('dd MMM HH:mm ZZZZ')}
          </div>
        </div>
        <GlobalSummaryTable
          forecast={forecastData}
          summarizedMeasurements={summarizedMeasurementData}
          showAllColoured={showAllColoured}
        />
      </div>
    </div>
  )
}

export default GlobalSummary
