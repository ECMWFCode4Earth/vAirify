import ReactECharts from 'echarts-for-react'
import { DateTime } from 'luxon'

import { getForecastOptions } from './average-comparison-chart-builder'
import classes from './AverageComparisonChart.module.css'
import { useForecastContext } from '../../../context'
import {
  averageAqiValues,
  sortMeasurements,
} from '../../../services/calculate-measurements-aqi-averages/calculate-measurement-aqi-averages-service'
import { getInSituPercentage } from '../../../services/forecast-time-service'
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
  const { forecastBaseDate, maxForecastDate, maxInSituDate } =
    useForecastContext()

  let measurementsAveragedData
  if (props.measurementsData) {
    const sortedMeasurements = sortMeasurements(
      props.measurementsData,
      props.forecastBaseTime,
    )
    measurementsAveragedData = averageAqiValues(sortedMeasurements)
  }

  const zoomPercent = getInSituPercentage(
    forecastBaseDate,
    maxForecastDate,
    maxInSituDate,
  )

  return (
    <ReactECharts
      className={classes['chart']}
      option={getForecastOptions(
        zoomPercent,
        props.forecastData,
        measurementsAveragedData,
      )}
      notMerge
    />
  )
}
