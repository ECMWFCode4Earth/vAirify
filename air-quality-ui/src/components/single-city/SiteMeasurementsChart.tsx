import { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useEffect, useState } from 'react'

import classes from './SiteMeasurementsChart.module.css'
import { PollutantType, pollutantTypeDisplay } from '../../models'
import { convertToLocalTime } from '../../services/echarts-service'
import { MeasurementsResponseDto } from '../../services/types'

interface SiteMeasurementsChartProps {
  measurementsBySite: Record<string, MeasurementsResponseDto[]>
  pollutantType: PollutantType
}

const getChartOptions = (
  pollutantType: PollutantType,
  measurementsBySite: Record<string, MeasurementsResponseDto[]>,
): EChartsOption => {
  return {
    xAxis: {
      type: 'time',
    },
    yAxis: {
      type: 'value',
      name: 'µg/m³',
      nameGap: 30,
      nameLocation: 'middle',
    },
    series: Object.entries(measurementsBySite).map(
      ([siteName, measurements]) => ({
        type: 'line',
        data: measurements
          .filter((f) => f[pollutantType] !== undefined)
          .map((f) => [
            convertToLocalTime(f.measurement_date),
            f[pollutantType],
          ]),
        name: siteName,
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

export const SiteMeasurementsChart = (
  props: SiteMeasurementsChartProps,
): JSX.Element => {
  const [echartOptions, setEchartOptions] = useState<EChartsOption>(
    getChartOptions(props.pollutantType, props.measurementsBySite),
  )
  useEffect(() => {
    const newOptions = getChartOptions(
      props.pollutantType,
      props.measurementsBySite,
    )
    setEchartOptions(newOptions)
  }, [props])

  return (
    <>
      <label className={classes['chart-label']}>
        {pollutantTypeDisplay[props.pollutantType]}
      </label>
      <ReactECharts
        className={classes['chart']}
        option={echartOptions}
        notMerge
      />
    </>
  )
}
