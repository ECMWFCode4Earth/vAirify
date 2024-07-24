import { EChartsOption, SeriesOption } from 'echarts'

import { AverageAqiValues } from '../../../services/calculate-measurements-aqi-averages/calculate-measurement-aqi-averages-service'
import { convertToLocalTime } from '../../../services/echarts-service'
import { ForecastResponseDto } from '../../../services/types'
import {
  baseOptions,
  forecastLine,
  measurementLine,
  yAxisOptions,
} from '../base-chart-builder'

export const getOptions = (zoomPercent: number): EChartsOption => {
  return {
    ...baseOptions('AQI', zoomPercent),
    yAxis: yAxisOptions('AQI', 6),
    tooltip: {
      trigger: 'axis',
    },
  }
}

const generateForecastLine = (
  forecastData?: ForecastResponseDto[],
): SeriesOption => {
  return {
    ...forecastLine(),
    data: forecastData?.map((dataToPlot) => [
      convertToLocalTime(dataToPlot.valid_time),
      dataToPlot.overall_aqi_level,
    ]),
  }
}

const generateMeasurementLine = (
  measurementsAveragedData?: AverageAqiValues[] | undefined,
) => {
  return {
    data: measurementsAveragedData?.map((dataToPlot) => [
      convertToLocalTime(dataToPlot.measurementDate),
      dataToPlot.meanAqiValue,
    ]),
    type: 'line',
    name: 'Measurement',
    ...measurementLine(5),
  }
}

export const getForecastOptions = (
  zoomPercent: number,
  forecastData?: ForecastResponseDto[],
  measurementsAveragedData?: AverageAqiValues[] | undefined,
) => {
  const forecastPlot = generateForecastLine(forecastData)
  const measurementPlot = generateMeasurementLine(measurementsAveragedData)
  const options = getOptions(zoomPercent)

  return {
    ...options,
    series: [forecastPlot, measurementPlot],
  }
}
