import ReactECharts from 'echarts-for-react'
import { DateTime } from 'luxon'
import { useCallback, useMemo, useRef } from 'react'

import { getForecastOptions } from './average-comparison-chart-builder'
import classes from './AverageComparisonChart.module.css'
import { useForecastContext } from '../../../context'
import {
  averageAqiValues,
  sortMeasurements,
} from '../../../services/calculate-measurements-aqi-averages/calculate-measurement-aqi-averages-service'
import {
  formatDateRange,
  updateChartSubtext,
} from '../../../services/echarts-service'
import { getInSituPercentage } from '../../../services/forecast-time-service'
import {
  ForecastResponseDto,
  MeasurementsResponseDto,
} from '../../../services/types'

interface AverageComparisonChartProps {
  cityName: string
  forecastData?: ForecastResponseDto[]
  measurementsData?: MeasurementsResponseDto[]
  forecastBaseTime: DateTime<boolean>
}

export const AverageComparisonChart = (
  props: AverageComparisonChartProps,
): JSX.Element => {
  const chartRef = useRef<ReactECharts>(null)
  const { forecastBaseDate, maxForecastDate, maxInSituDate } =
    useForecastContext()

  const measurementsAveragedData = useMemo(() => {
    if (props.measurementsData) {
      const sortedMeasurements = sortMeasurements(
        props.measurementsData,
        props.forecastBaseTime,
      )
      return averageAqiValues(sortedMeasurements)
    }
  }, [props.measurementsData, props.forecastBaseTime])

  const zoomPercent = getInSituPercentage(
    forecastBaseDate,
    maxForecastDate,
    maxInSituDate,
  )

  const zoomEventHandler = useCallback(() => {
    const instance = chartRef.current?.getEchartsInstance()
    updateChartSubtext(instance!)
  }, [])

  return (
    <ReactECharts
      ref={chartRef}
      className={classes['chart']}
      onEvents={{ dataZoom: zoomEventHandler }}
      option={getForecastOptions(
        props.cityName,
        formatDateRange(forecastBaseDate, maxInSituDate),
        zoomPercent,
        props.forecastData,
        measurementsAveragedData,
      )}
      notMerge
    />
  )
}
