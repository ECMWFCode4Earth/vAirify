import ReactECharts from 'echarts-for-react'
import { DateTime } from 'luxon'

import classes from './AverageComparisonChart.module.css'
import {
  AverageAqiValues,
  averageAqiValues,
  sortMeasurements,
} from './calculate-measurements-aqi-averages/CalculateMeasurementAqiAverages'
import {
  convertToLocalTime,
  xAxisFormat,
} from '../../../services/echarts-service'
import {
  ForecastResponseDto,
  MeasurementsResponseDto,
} from '../../../services/types'
function getChartOptions(
  forecastData?: ForecastResponseDto[],
  measurementsAveragedData?: AverageAqiValues[] | undefined,
) {
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
      {
        data: measurementsAveragedData?.map((f) => [
          convertToLocalTime(f[0].toString()),
          f[1],
        ]),
        type: 'line',
        name: 'Measurement',
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
  measurementsData?: MeasurementsResponseDto[]
  forecastBaseTime: DateTime<boolean>
}

export const AverageComparisonChart = (
  props: AverageComparisonChartProps,
): JSX.Element => {
  let measurementsAveragedData
  console.log(props.measurementsData)
  if (props.measurementsData) {
    const sortedMeasurements = sortMeasurements(
      props.measurementsData,
      props.forecastBaseTime,
    )
    console.log(sortedMeasurements)
    measurementsAveragedData = averageAqiValues(sortedMeasurements)
  }
  console.log(measurementsAveragedData)
  return (
    <ReactECharts
      className={classes['chart']}
      option={getChartOptions(props.forecastData, measurementsAveragedData)}
      notMerge
    />
  )
}
