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

export const measurementLine = (
  width: number | undefined = 1,
): LineSeriesOption => {
  return {
    lineStyle: {
      width,
      type: 'solid',
      opacity: 0.5,
    },
    z: 1,
    symbol: 'roundRect',
  }
}

export const yAxisOptions = (
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

export const baseOptions = (
  titleText: string,
  zoomPercent: number,
  subtext: string,
): EChartsOption => {
  return {
    title: {
      text: titleText,
      subtext,
      left: 'center',
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: xAxisFormat,
      },
    },
    dataZoom: {
      show: true,
      end: zoomPercent,
    },
    animation: false,
    toolbox: {
      feature: {
        saveAsImage: {
          pixelRatio: 3,
          excludeComponents: ['dataZoom', 'toolbox'],
        },
      },
      right: '10%',
    },
  }
}
