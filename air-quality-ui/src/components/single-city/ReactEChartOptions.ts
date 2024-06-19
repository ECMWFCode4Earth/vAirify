import { toolTipFormat, xAxisFormat } from './formattingFunctions'

export default function reactEchartOptions(
  processedData: (string | number)[][] | undefined,
) {
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
