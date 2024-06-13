import './SingleCity.css'
import ReactECharts from 'echarts-for-react'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { getLatestBaseForecastTime } from './HandleTime'
import { useGetSingleCityForecastData } from './SingleCityQueries'
import { Measurements } from './SingleCityTypes'

function xAxisFormat(timestamp: string, index: number) {
  const date = DateTime.fromMillis(parseInt(timestamp), {
    zone: 'utc',
  })
  if (index === 0 || (date.hour === 3 && index !== 1)) {
    return `${date.toFormat('yyyy-MM-dd HH:mm')}`
  }
  return `${date.toFormat('HH:mm')}`
}

function toolTipFormat(params: { value: [string, number] }) {
  return `x: ${DateTime.fromMillis(parseInt(params.value[0]), { zone: 'utc' }).toFormat('yyyy-MM-dd HH:mm')}, y: ${params.value[1]}`
}

function SingleCity() {
  const { name } = useParams()
  const [processedData, setProcessedData] = useState()

  let todaysDate = DateTime.now().toUTC()
  let dateFiveDaysAgo = todaysDate.minus(432000000).toUTC() //Minus 5 days in milliseconds
  todaysDate = todaysDate.set({ minute: 0, second: 0, millisecond: 0 })
  dateFiveDaysAgo = dateFiveDaysAgo.set({
    minute: 0,
    second: 0,
    millisecond: 0,
  })

  const requestResult = useGetSingleCityForecastData(
    getLatestBaseForecastTime(dateFiveDaysAgo).toISO({ includeOffset: false }) +
      '+00:00',
    getLatestBaseForecastTime(todaysDate).toISO({ includeOffset: false }) +
      '+00:00',
    'city',
    getLatestBaseForecastTime(dateFiveDaysAgo).toISO({ includeOffset: false }) +
      '+00:00',
    name,
  )

  useEffect(() => {
    if (requestResult.data) {
      setProcessedData(
        requestResult.data.map((measurement: Measurements) => {
          return [
            DateTime.fromISO(measurement.valid_date).toMillis(),
            measurement.overall_aqi_level,
          ]
        }),
      )
    }
  }, [requestResult.data])

  const reactEChartOptions = {
    xAxis: {
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

  return processedData ? (
    <div className="chart">
      <ReactECharts option={reactEChartOptions} />
    </div>
  ) : (
    <h1>Loading</h1>
  )
}

export default SingleCity
