import ReactECharts from 'echarts-for-react'
import { DateTime } from 'luxon'

import classes from './AverageComparisonChart.module.css'
import {
  AverageAqiValues,
  averageAqiValues,
  sortMeasurements,
} from '../../../services/calculate-measurements-aqi-averages/calculate-measurement-aqi-averages-service'
import {
  convertToLocalTime,
  xAxisFormat,
} from '../../../services/echarts-service'
import {
  ForecastResponseDto,
  MeasurementsResponseDto,
} from '../../../services/types'
const getChartOptions = (
  forecastData?: ForecastResponseDto[],
  measurementsAveragedData?: AverageAqiValues[] | undefined,
) => {
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
        data: forecastData?.map((dataToPlot) => [
          convertToLocalTime(dataToPlot.valid_time),
          dataToPlot.overall_aqi_level,
        ]),
        type: 'line',
        name: 'Forecast',
      },
      {
        data: measurementsAveragedData?.map((dataToPlot) => [
          convertToLocalTime(dataToPlot.measurementDate),
          dataToPlot.meanAqiValue,
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
  if (props.measurementsData) {
    const sortedMeasurements = sortMeasurements(
      props.measurementsData,
      props.forecastBaseTime,
    )
    measurementsAveragedData = averageAqiValues(sortedMeasurements)
  }
  return (
    <ReactECharts
      className={classes['chart']}
      option={getChartOptions(props.forecastData, measurementsAveragedData)}
      notMerge
    />
  )
}
