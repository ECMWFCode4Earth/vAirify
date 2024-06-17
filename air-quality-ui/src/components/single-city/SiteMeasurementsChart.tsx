import { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { DateTime } from 'luxon'
import { useMemo } from 'react'

import classes from './SiteMeasurementsChart.module.css'
import { PollutantType, pollutantTypeDisplay } from '../../models'
import { MeasurementsResponseDto } from '../../services/types'

interface MeasurementsBySiteChartProps {
  measurementsBySite: Record<string, MeasurementsResponseDto[]>
  pollutantType: PollutantType
}

const convertToLocalTime = (measurementDate: string): string | null => {
  const { year, month, day, hour, minute, second } = DateTime.fromISO(
    measurementDate,
    { zone: 'utc' },
  )
  // Strip UTC timezone off for echarts
  return DateTime.fromObject(
    {
      year,
      month,
      day,
      hour,
      minute,
      second,
    },
    { zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  ).toISO()
}

const getChartOptions = (
  pollutantType: PollutantType,
  measurementsByStation: Record<string, MeasurementsResponseDto[]>,
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
    series: Object.entries(measurementsByStation).map(([k, v]) => ({
      type: 'line',
      data: v
        .filter((f) => f[pollutantType] !== undefined)
        .map((f) => [convertToLocalTime(f.measurement_date), f[pollutantType]]),
      name: k,
    })),
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
    // tooltip: {
    //   trigger: 'item',
    //   formatter: function (params) {
    //     const data = (params.seriesIndex === 0 ? forecastData : realData)[
    //       params.dataIndex
    //     ]
    //     return Object.entries(data)
    //       .filter(([k]) => k !== 'day')
    //       .map(([k, v]) => `${params.marker}${k}: ${v}<br/>`)
    //       .join('')
    //   },
    // },
  }
}

const MeasurementsBySiteChart = (
  props: MeasurementsBySiteChartProps,
): JSX.Element => {
  const echartOptions = useMemo(
    () => getChartOptions(props.pollutantType, props.measurementsBySite),
    [props.pollutantType, props.measurementsBySite],
  )

  return (
    <>
      <label className={classes['chart-label']}>
        {pollutantTypeDisplay[props.pollutantType]}
      </label>
      <ReactECharts className={classes['chart']} option={echartOptions} />
    </>
  )
}

export default MeasurementsBySiteChart
