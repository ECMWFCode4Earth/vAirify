import { EChartsOption, LineSeriesOption, YAXisComponentOption } from 'echarts'

import { xAxisFormat } from '../../services/echarts-service'

export const forecastLine = (): LineSeriesOption => {
  return {
    type: 'line',
    name: 'Forecast',
    color: 'black',
    lineStyle: {
      width: 5,
      type: 'dashed',
    },
    z: 2,
  }
}

export const measurementLine = (): LineSeriesOption => {
  return {
    lineStyle: {
      width: 1,
      type: 'solid',
      opacity: 0.5,
    },
    z: 1,
    symbol: 'roundRect',
  }
}

export const yAxis = (
  name: string,
  max: number | undefined = undefined,
): YAXisComponentOption => {
  return {
    type: 'value',
    nameGap: 35,
    nameLocation: 'middle',
    name,
    max,
  }
}

export const baseOptions = (titleText: string): EChartsOption => {
  return {
    title: {
      text: titleText,
      left: 'center',
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: xAxisFormat,
      },
    },
    animation: false,
  }
}
