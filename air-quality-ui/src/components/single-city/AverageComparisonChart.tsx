import ReactECharts from 'echarts-for-react'

import classes from './AverageComparisonChart.module.css'
import { toolTipFormat, xAxisFormat } from './formattingFunctions'

function getChartOptions(processedData: (string | number)[][] | undefined) {
  return {
    xAxis: {
      name: 'Time',
      type: 'category',
      max: 'dataMax',
      boundaryGap: false,
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        showMinLabel: true,
        showMaxLabel: true,
        hideOverlap: false,
        fontSize: 7,
        rotate: 45,
        formatter: xAxisFormat,
      },
    },
    yAxis: {
      type: 'value',
      name: 'AQI',
      max: 6,
    },
    series: [
      {
        data: processedData,
        type: 'line',
        name: 'Forecast',
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: toolTipFormat,
    },
  }
}

interface AverageComparisonChartProps {
  data?: (string | number)[][]
  isPending: boolean
}

export const AverageComparisonChart = (
  props: AverageComparisonChartProps,
): JSX.Element => {
  return (
    <ReactECharts
      className={classes['chart']}
      option={getChartOptions(props.data)}
      showLoading={props.isPending}
      loadingOption={{
        text: 'Loading data...',
      }}
    />
  )
}
