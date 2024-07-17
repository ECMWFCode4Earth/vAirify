import { EChartsOption } from 'echarts'

import { AverageAqiValues } from '../../../services/calculate-measurements-aqi-averages/calculate-measurement-aqi-averages-service'
import {
  convertToLocalTime,
  xAxisFormat,
} from '../../../services/echarts-service'
import { ForecastResponseDto } from '../../../services/types'

export const getOptions = (): EChartsOption => {
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
    tooltip: {
      trigger: 'axis',
    },
    legend: {},
  }
}

const generateForecastLine = (forecastData?: ForecastResponseDto[]) => {
  return {
    data: forecastData?.map((dataToPlot) => [
      convertToLocalTime(dataToPlot.valid_time),
      dataToPlot.overall_aqi_level,
    ]),
    type: 'line',
    name: 'Forecast',
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
