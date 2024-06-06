import './SingleCity.css'
import ReactECharts from 'echarts-for-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useGetSingleCityForecastData } from './SingleCityQueries'
import { Measurements, ProcessDataResult } from './SingleCityTypes'

function processData(dataInput: Measurements[]): ProcessDataResult {
  const times = []
  const aqiValues = []
  dataInput.sort((a, b) => {
    if (new Date(a.valid_date) < new Date(b.valid_date)) {
      return -1
    }
    if (new Date(a.valid_date) > new Date(b.valid_date)) {
      return 1
    }
    return 0
  })

  for (let i = 0; i < dataInput.length; i++) {
    times.push(dataInput[i]['valid_date'])
    aqiValues.push(dataInput[i]['overall_aqi_level'])
  }
  return [times, aqiValues]
}
function SingleCity() {
  const { city } = useParams()
  const [data, setData] = useState<ProcessDataResult>()

  const result = useGetSingleCityForecastData(
    '2024-05-27T00:00:00.000+00:00',
    '2024-05-27T23:00:00.000+00:00',
    'city',
    '2024-05-27T12:00:00.000+00:00',
    city,
  )

  useEffect(() => {
    if (result.data) {
      setData(processData(result.data))
    }
  }, [result.data])

  if (data) {
    console.log(data[0])
    console.log(data[1])
    const Option = {
      xAxis: {
        type: 'time',
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: data[1],
          type: 'line',
        },
      ],
    }
    return (
      <div className="chart">
        <ReactECharts notMerge={true} lazyUpdate={true} option={Option} />
      </div>
    )
  }
  return <h1>Loading</h1>
}

export default SingleCity
