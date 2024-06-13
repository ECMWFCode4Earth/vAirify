import './SingleCity.css'
import ReactECharts from 'echarts-for-react'
import { DateTime } from 'luxon'
import { useParams } from 'react-router-dom'

import { formatDate, getLatestBaseForecastTime } from './HandleTime'
import { useGetSingleCityForecastData } from './SingleCityQueries'
import { Measurements } from './SingleCityTypes'

function SingleCity() {
  const { name } = useParams()

  const todaysDate = new Date()
  const dateFiveDaysAgo = new Date(
    todaysDate.getTime() - 5 * 24 * 60 * 60 * 1000,
  )

  const result = useGetSingleCityForecastData(
    formatDate(dateFiveDaysAgo, '00'),
    formatDate(todaysDate, '00'),
    'city',
    formatDate(getLatestBaseForecastTime(DateTime.fromJSDate(dateFiveDaysAgo))),
    name,
  )

  return result.data ? (
    <div className="chart">
      <ReactECharts
        option={{
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
              formatter: (timestamp: string) => {
                return `${DateTime.fromMillis(parseInt(timestamp), { zone: 'utc' }).toFormat('yyyy-MM-dd HH:mm')}`
              },
            },
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              data: result.data.map((measurement: Measurements) => {
                return [
                  DateTime.fromISO(measurement.valid_date).toMillis(),
                  measurement.overall_aqi_level,
                ]
              }),
              type: 'line',
              name: 'Forecast',
            },
          ],
          tooltip: {
            trigger: 'item',
            formatter: function (params: { value: [string, number] }) {
              return `x: ${DateTime.fromMillis(parseInt(params.value[0]), { zone: 'utc' }).toFormat('yyyy-MM-dd HH:mm')}, y: ${params.value[1]}`
            },
          },
        }}
      />
    </div>
  ) : (
    <h1>Loading</h1>
  )
}

export default SingleCity
