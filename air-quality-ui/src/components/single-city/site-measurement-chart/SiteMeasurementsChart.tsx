import ReactECharts from 'echarts-for-react'
import { useCallback } from 'react'

import { generateMeasurementChart } from './site-measurement-chart-builder'
import classes from './SiteMeasurementsChart.module.css'
import { useForecastContext } from '../../../context'
import { PollutantType } from '../../../models'
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
        option={generateMeasurementChart(
          pollutantType,
          zoomPercent,
          measurementsBySite,
          forecastData,
          seriesColorsBySite,
        )}
      />
    </>
  )
}
