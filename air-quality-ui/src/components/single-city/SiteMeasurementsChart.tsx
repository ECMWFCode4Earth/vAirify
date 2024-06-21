import { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useCallback, useEffect, useState } from 'react'

import classes from './SiteMeasurementsChart.module.css'
import { PollutantType, pollutantTypeDisplay } from '../../models'
import { convertToLocalTime } from '../../services/echarts-service'
import { MeasurementsResponseDto } from '../../services/types'

interface SiteMeasurementsChartProps {
  measurementsBySite: Record<string, MeasurementsResponseDto[]>
  onSiteClick: (siteName: string) => void
  pollutantType: PollutantType
  seriesColorsBySite?: Record<string, string>
}

const getChartOptions = (
  pollutantType: PollutantType,
  measurementsBySite: Record<string, MeasurementsResponseDto[]>,
  seriesColorsBySite?: Record<string, string>,
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
    series: Object.entries(measurementsBySite).map(
      ([siteName, measurements]) => ({
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
      }),
    ),
    dataZoom: [
      {
        show: true,
        realtime: false,
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
  measurementsBySite,
  seriesColorsBySite,
  onSiteClick,
}: SiteMeasurementsChartProps): JSX.Element => {
  const [eChartOptions, setEchartOptions] = useState<EChartsOption>(
    getChartOptions(pollutantType, measurementsBySite, seriesColorsBySite),
  )
  useEffect(() => {
    const newOptions = getChartOptions(
      pollutantType,
      measurementsBySite,
      seriesColorsBySite,
    )
    setEchartOptions(newOptions)
  }, [pollutantType, measurementsBySite, seriesColorsBySite])

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
        seriesName
      ) {
        onSiteClick(seriesName)
      }
    },
    [onSiteClick],
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
        option={eChartOptions}
      />
    </>
  )
}
