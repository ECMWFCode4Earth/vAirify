import { EChartsOption, SeriesOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useCallback, useMemo } from 'react'

import classes from './SiteMeasurementsChart.module.css'
import { useForecastContext } from '../../context'
import { PollutantType, pollutantTypeDisplay } from '../../models'
import { convertToLocalTime } from '../../services/echarts-service'
import { getInSituPercentage } from '../../services/forecast-time-service'
import {
  ForecastResponseDto,
  MeasurementsResponseDto,
} from '../../services/types'

interface SiteMeasurementsChartProps {
  forecastData: ForecastResponseDto[]
  measurementsBySite: Record<string, MeasurementsResponseDto[]>
  onSiteClick: (siteName: string) => void
  pollutantType: PollutantType
  seriesColorsBySite?: Record<string, string>
}

const createForecastSeries = (
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

const createMeasurementSeries = (
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
  ...series: SeriesOption[]
): EChartsOption => {
  return {
    xAxis: {
      type: 'time',
    },
    yAxis: {
      type: 'value',
      name: 'µg/m³',
      nameGap: 50,
      nameLocation: 'middle',
    },
    series,
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

export const SiteMeasurementsChart = ({
  pollutantType,
  forecastData,
  measurementsBySite,
  seriesColorsBySite,
  onSiteClick,
}: SiteMeasurementsChartProps): JSX.Element => {
  const { forecastBaseDate, maxForecastDate, maxInSituDate } =
    useForecastContext()

  const measurementSeries = useMemo(
    () =>
      createMeasurementSeries(
        pollutantType,
        measurementsBySite,
        seriesColorsBySite,
      ),
    [pollutantType, measurementsBySite, seriesColorsBySite],
  )

  const forecastSeries = useMemo(
    () => createForecastSeries(pollutantType, forecastData),
    [pollutantType, forecastData],
  )

  const eChartEventHandler = useCallback(
    ({
      componentType,
      componentSubType,
      seriesName,
    }: {
      componentType: string
      componentSubType: string
      seriesName?: string
    }) => {
      if (
        componentType === 'series' &&
        componentSubType === 'line' &&
        seriesName &&
        seriesName !== 'Forecast'
      ) {
        onSiteClick(seriesName)
      }
    },
    [onSiteClick],
  )

  const zoomPercent = getInSituPercentage(
    forecastBaseDate,
    maxForecastDate,
    maxInSituDate,
  )

  return (
    <>
      <label className={classes['chart-label']}>
        {pollutantTypeDisplay[pollutantType]}
      </label>
      <ReactECharts
        className={classes['chart']}
        onEvents={{
          click: eChartEventHandler,
        }}
        notMerge
        option={getChartOptions(
          zoomPercent,
          forecastSeries,
          ...measurementSeries,
        )}
      />
    </>
  )
}
