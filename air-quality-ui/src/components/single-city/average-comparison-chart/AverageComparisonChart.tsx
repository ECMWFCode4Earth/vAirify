import ReactECharts from 'echarts-for-react'
import { DateTime } from 'luxon'

import { getForecastOptions } from './average-composition-chart-builder'
import classes from './AverageComparisonChart.module.css'
import {
  averageAqiValues,
  sortMeasurements,
} from '../../../services/calculate-measurements-aqi-averages/calculate-measurement-aqi-averages-service'
import {
  ForecastResponseDto,
  MeasurementsResponseDto,
} from '../../../services/types'

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
      option={getForecastOptions(props.forecastData, measurementsAveragedData)}
      notMerge
    />
  )
}
