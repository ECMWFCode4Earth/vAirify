import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts'

const getChartOptions = (title: string): EChartsOption => ({
  title: {
    text: title,
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }
  ]
})

interface SummaryBarChartProps {
  title: string
}

const SummaryBarChart = ({ title }: SummaryBarChartProps): JSX.Element => {
  return (
    <ReactECharts
      style={{ height: '100%', width: '100%' }}
      option={getChartOptions(title)}
    />
  )
}

export default SummaryBarChart 