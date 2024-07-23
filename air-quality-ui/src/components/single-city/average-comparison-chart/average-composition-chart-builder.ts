import { EChartsOption, SeriesOption } from 'echarts'

import { AverageAqiValues } from '../../../services/calculate-measurements-aqi-averages/calculate-measurement-aqi-averages-service'
import { convertToLocalTime } from '../../../services/echarts-service'
import { ForecastResponseDto } from '../../../services/types'
import {
  baseOptions,
  forecastLine,
  measurementLine,
} from '../base-chart-builder'

export const getOptions = (): EChartsOption => {
  return {
    ...baseOptions('AQI'),
    yAxis: {
      type: 'value',
      name: 'AQI',
      max: 6,
      nameGap: 30,
      nameLocation: 'middle',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      left: 'right',
      padding: [40, 60],
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
    ...measurementLine(),
  }
}

export const getForecastOptions = (
  forecastData?: ForecastResponseDto[],
  measurementsAveragedData?: AverageAqiValues[] | undefined,
) => {
  const forecastPlot = generateForecastLine(forecastData)
  const measurementPlot = generateMeasurementLine(measurementsAveragedData)
  const options = getOptions()

  return {
    ...options,
    series: [forecastPlot, measurementPlot],
  }
}
