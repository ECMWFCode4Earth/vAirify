import { useQuery } from '@tanstack/react-query'
import ReactECharts from 'echarts-for-react'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import reactEchartOptions from './ReactEChartOptions'
import classes from './SingleCity.module.css'
import { getForecastData } from '../../services/forecast-data-service'
import {
  getLatestBaseForecastTime,
  getLatestValidForecastTime,
} from '../../services/forecast-time-service'
import { ForecastResponseDto } from '../../services/types'

function SingleCity() {
  const { name } = useParams()
  const [processedData, setProcessedData] = useState<(string | number)[][]>()

  let todaysDate = DateTime.now().toUTC()
  let dateFiveDaysAgo = todaysDate.minus({ days: 5 }).toUTC()
  todaysDate = todaysDate.set({ minute: 0, second: 0, millisecond: 0 })
  dateFiveDaysAgo = dateFiveDaysAgo.set({
    minute: 0,
    second: 0,
    millisecond: 0,
  })

  const { data, isPending } = useQuery({
    queryKey: ['forecast'],
    queryFn: () =>
      getForecastData(
        getLatestValidForecastTime(dateFiveDaysAgo),
        getLatestValidForecastTime(todaysDate),
        getLatestBaseForecastTime(dateFiveDaysAgo),
        name,
      ),
  })
  useEffect(() => {
    if (data) {
      setProcessedData(
        data.map((measurement: ForecastResponseDto) => {
          return [measurement.valid_time, measurement.overall_aqi_level]
        }),
      )
    }
  }, [data])

  return (
    <div className={`${classes['chart']} `} data-testid="chart">
      <ReactECharts
        option={reactEchartOptions(processedData)}
        showLoading={isPending}
        loadingOption={{
          text: 'Loading data...',
        }}
      />
    </div>
  )
}

export default SingleCity
