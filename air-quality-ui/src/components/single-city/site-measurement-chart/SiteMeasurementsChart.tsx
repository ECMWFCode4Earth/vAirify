import ReactECharts from 'echarts-for-react'
import { useCallback, useMemo } from 'react'

import {
  GenerateMeasurementChart,
  createForecastSeries,
  createMeasurementSeries,
} from './site-measurement-chart-builder'
import classes from './SiteMeasurementsChart.module.css'
import { useForecastContext } from '../../../context'
import { PollutantType, pollutantTypeDisplay } from '../../../models'
import { getInSituPercentage } from '../../../services/forecast-time-service'
import {
  ForecastResponseDto,
  MeasurementsResponseDto,
} from '../../../services/types'

interface SiteMeasurementsChartProps {
  forecastData: ForecastResponseDto[]
  measurementsBySite: Record<string, MeasurementsResponseDto[]>
  onSiteClick: (siteName: string) => void
  pollutantType: PollutantType
  seriesColorsBySite?: Record<string, string>
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
      <ReactECharts
        className={classes['chart']}
        onEvents={{
          click: eChartEventHandler,
        }}
        notMerge
        option={GenerateMeasurementChart(
          pollutantTypeDisplay[pollutantType],
          zoomPercent,
          forecastSeries,
          ...measurementSeries,
        )}
      />
    </>
  )
}
