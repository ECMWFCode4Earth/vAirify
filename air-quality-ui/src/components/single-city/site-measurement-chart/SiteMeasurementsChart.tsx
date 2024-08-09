import ReactECharts from 'echarts-for-react'
import { useCallback, useRef } from 'react'

import { generateMeasurementChart } from './site-measurement-chart-builder'
import classes from './SiteMeasurementsChart.module.css'
import { useForecastContext } from '../../../context'
import { PollutantType } from '../../../models'
import {
  createSubtext,
  updateChartSubtext,
} from '../../../services/echarts-service'
import { getInSituPercentage } from '../../../services/forecast-time-service'
import {
  ForecastResponseDto,
  MeasurementsResponseDto,
} from '../../../services/types'

interface SiteMeasurementsChartProps {
  cityName: string
  forecastData: ForecastResponseDto[]
  measurementsBySite: Record<string, MeasurementsResponseDto[]>
  onSiteClick: (siteName: string) => void
  pollutantType: PollutantType
  seriesColorsBySite?: Record<string, string>
}

export const SiteMeasurementsChart = ({
  cityName,
  pollutantType,
  forecastData,
  measurementsBySite,
  seriesColorsBySite,
  onSiteClick,
}: SiteMeasurementsChartProps): JSX.Element => {
  const chartRef = useRef<ReactECharts>(null)

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

  const zoomEventHandler = useCallback(() => {
    const instance = chartRef.current?.getEchartsInstance()
    updateChartSubtext(instance!, forecastBaseDate)
  }, [forecastBaseDate])

  return (
    <>
      <ReactECharts
        ref={chartRef}
        className={classes['chart']}
        onEvents={{
          click: eChartEventHandler,
          dataZoom: zoomEventHandler,
        }}
        notMerge
        option={generateMeasurementChart(
          pollutantType,
          zoomPercent,
          measurementsBySite,
          forecastData,
          createSubtext(forecastBaseDate, forecastBaseDate, maxInSituDate),
          cityName,
          seriesColorsBySite,
        )}
      />
    </>
  )
}
