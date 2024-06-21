import ReactECharts from 'echarts-for-react'

import classes from './AverageComparisonChart.module.css'
import { convertToLocalTime, xAxisFormat } from '../../services/echarts-service'
import { ForecastResponseDto } from '../../services/types'

function getChartOptions(forecastData?: ForecastResponseDto[]) {
  return {
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: xAxisFormat,
      },
    },
    yAxis: {
      type: 'value',
      name: 'AQI',
      max: 6,
      nameGap: 30,
      nameLocation: 'middle',
    },
    series: [
      {
        data: forecastData?.map((f) => [
          convertToLocalTime(f.valid_time),
          f.overall_aqi_level,
        ]),
        type: 'line',
        name: 'Forecast',
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
    legend: {},
  }
}

interface AverageComparisonChartProps {
  forecastData?: ForecastResponseDto[]
}

export const AverageComparisonChart = (
  props: AverageComparisonChartProps,
): JSX.Element => {
  return (
    <ReactECharts
      className={classes['chart']}
      option={getChartOptions(props.forecastData)}
      notMerge
    />
  )
}
