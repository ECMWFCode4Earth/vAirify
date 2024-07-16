import { EChartsOption, SeriesOption } from 'echarts'

import { PollutantType } from '../../../models'
import { convertToLocalTime } from '../../../services/echarts-service'
import {
  ForecastResponseDto,
  MeasurementsResponseDto,
} from '../../../services/types'

export const createForecastSeries = (
  pollutantType: PollutantType,
  forecastData: ForecastResponseDto[],
): SeriesOption => {
  return {
    type: 'line',
    data: forecastData.map((data) => [
      convertToLocalTime(data.valid_time),
      data[pollutantType].value.toFixed(1),
    ]),
    name: 'Forecast',
    color: 'black',
    lineStyle: {
      width: 5,
      type: 'dashed',
    },
    zlevel: 2,
    z: 2,
  }
}

export const createMeasurementSeries = (
  pollutantType: PollutantType,
  measurementsBySite: Record<string, MeasurementsResponseDto[]>,
  seriesColorsBySite?: Record<string, string>,
): SeriesOption[] =>
  Object.entries(measurementsBySite).map(([siteName, measurements]) => ({
    type: 'line',
    data: measurements
      .filter((f) => f[pollutantType] !== undefined)
      .map((f) => [
        convertToLocalTime(f.measurement_date),
        f[pollutantType]?.toFixed(1),
      ]),
    name: siteName,
    ...(seriesColorsBySite && {
      color: seriesColorsBySite[siteName],
    }),
    triggerLineEvent: true,
    lineStyle: {
      width: 1,
      type: 'solid',
      opacity: 0.5,
    },
    zlevel: 1,
    z: 1,
    symbol: 'roundRect',
  }))

const getChartOptions = (
  zoomPercent: number,
  pollutantName: string,
): EChartsOption => {
  return {
    title: {
      text: pollutantName,
      left: 'center',
    },
    xAxis: {
      type: 'time',
    },
    yAxis: {
      type: 'value',
      name: 'µg/m³',
      nameGap: 50,
      nameLocation: 'middle',
    },
    dataZoom: [
      {
        show: true,
        realtime: false,
        end: zoomPercent,
      },
      {
        type: 'inside',
        realtime: false,
      },
    ],
    tooltip: {
      trigger: 'item',
    },
  }
}

export const GenerateMeasurementChart = (
  pollutantName: string,
  zoomPercent: number,
  ...series: SeriesOption[]
) => {
  const options = getChartOptions(zoomPercent, pollutantName)

  return {
    ...options,
    series,
  }
}
