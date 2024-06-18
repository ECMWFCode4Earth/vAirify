import './SingleCity.css'
import { useQuery } from '@tanstack/react-query'
import ReactECharts from 'echarts-for-react'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { toolTipFormat, xAxisFormat } from './formattingFunctions'
import { getForecastData } from '../../services/forecast-data-service'
import {
  getLatestBaseForecastTime,
  getLatestValidForecastTime,
} from '../../services/forecast-time-service'
import { ForecastResponseDto } from '../../services/types'

function SingleCity() {
  const { name } = useParams()
  const [processedData, setProcessedData] = useState<number[][]>()
  const [isLoading, setIsLoading] = useState(true)

  let todaysDate = DateTime.now().toUTC()
  let dateFiveDaysAgo = todaysDate.minus(432000000).toUTC() //Minus 5 days in milliseconds
  todaysDate = todaysDate.set({ minute: 0, second: 0, millisecond: 0 })
  dateFiveDaysAgo = dateFiveDaysAgo.set({
    minute: 0,
    second: 0,
    millisecond: 0,
  })

  const { data } = useQuery({
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
          return [
            DateTime.fromISO(measurement.valid_time).toMillis(),
            measurement.overall_aqi_level,
          ]
        }),
      )
      setIsLoading(false)
    }
  }, [data])

  const reactEChartOptions = {
    xAxis: {
      name: 'Time',
      type: 'category',
      max: 'dataMax',
      boundaryGap: false,
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        showMinLabel: true,
        showMaxLabel: true,
        hideOverlap: false,
        fontSize: 7,
        rotate: 45,
        formatter: xAxisFormat,
      },
    },
    yAxis: {
      type: 'value',
      name: 'AQI',
      max: 6,
    },
    series: [
      {
        data: processedData,
        type: 'line',
        name: 'Forecast',
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: toolTipFormat,
    },
  }
  return (
    <div className="chart" data-testid="chart">
      <ReactECharts
        option={reactEChartOptions}
        showLoading={isLoading}
        loadingOption={{
          text: 'Loading data...',
        }}
      />
    </div>
  )
}

export default SingleCity
