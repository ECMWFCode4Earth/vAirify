import './SingleCity.css'
import ReactECharts from 'echarts-for-react'
import { DateTime, Interval } from 'luxon'
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

  console.log(result.data)
  return result.data ? (
    <div className="chart">
      <ReactECharts
        option={{
          xAxis: {
            type: 'time',
            max: 'dataMax',
            axisLabel: {
              showMinLabel: true,
              showMaxLabel: true,
              hideOverlap: false,
              fontSize: 7,
              align: 'right',
              rotate: 45,
              overflow: 'break',
              formatter: (timestamp: number) => {
                const date =
                  DateTime.fromMillis(timestamp).toFormat('yyyy-MM-dd, HH:mm')
                return `${date}`
              },
            },
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              data: result.data.map((measurement: Measurements) => {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
                const { year, month, day, hour, minute, second, millisecond } =
                  DateTime.fromISO(measurement.valid_date, {
                    zone: 'utc',
                  })
                const finishedob = [
                  DateTime.fromObject(
                    { year, month, day, hour, minute, second, millisecond },
                    {
                      zone: tz,
                    },
                  ).toFormat('yyyy-MM-dd HH:mm'),
                  measurement.overall_aqi_level,
                ]
                return finishedob
              }),
              type: 'line',
              name: 'Forecast',
            },
          ],
          tooltip: {
            trigger: 'item',
            formatter: function (params: { value: [string, number] }) {
              return `x: ${params.value[0]}, y: ${params.value[1]}`
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
