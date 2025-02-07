import ReactECharts from 'echarts-for-react'
import { MeasurementCounts } from '../../../services/measurement-data-service'
import { pollutantTypeDisplayShort } from '../../../models'

interface SummaryBarChartProps {
  title: string
  measurementCounts?: MeasurementCounts | null
  totalCities: number
}

const SummaryBarChart = ({ title, measurementCounts, totalCities }: SummaryBarChartProps): JSX.Element => {
  const getChartData = () => {
    if (!measurementCounts) return { pollutants: [], counts: [], coverage: [], maxCount: 0, maxPercentage: 0 }
    
    const pollutants = ['so2', 'no2', 'o3', 'pm10', 'pm2_5']

    const counts = pollutants.map(pollutant => ({
      value: Object.values(measurementCounts).reduce((sum, cityData) => {
        return sum + (cityData[pollutant] || 0)
      }, 0),
      label: {
        show: true,
        position: 'left',
        fontSize: 10
      }
    }))

    const maxCount = Math.max(...counts.map(item => item.value))

    const coverage = pollutants.map(pollutant => {
      const citiesWithData = Object.values(measurementCounts).filter(
        cityData => (cityData[pollutant] || 0) > 0
      ).length
      const percentage = Number(((citiesWithData / totalCities) * 100).toFixed(1))
      return {
        value: percentage,
        label: {
          show: true,
          position: 'right',
          fontSize: 10,
          formatter: `${percentage}%`
        }
      }
    })

    const maxPercentage = Math.ceil(Math.max(...coverage.map(item => item.value)))

    return {
      pollutants: pollutants.map(p => pollutantTypeDisplayShort[p]),
      counts,
      coverage,
      maxCount,
      maxPercentage
    }
  }

  const { pollutants, counts, coverage, maxCount, maxPercentage } = getChartData()

  const options = {
    title: [
      {
        text: 'number of measurements',
        left: '25%',
        top: 0,
        textAlign: 'center',
        textStyle: {
          fontSize: 12
        }
      },
      {
        text: 'cities covered',
        left: '75%',
        top: 0,
        textAlign: 'center',
        textStyle: {
          fontSize: 12
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: [
      { right: '55%', width: '35%', bottom: '3%', top: '15%' },
      { left: '55%', width: '35%', bottom: '3%', top: '15%' },
    ],
    xAxis: [
      {
        type: 'value',
        inverse: true,
        position: 'top',
        gridIndex: 0,
        max: maxCount,
        axisLabel: {
          formatter: '{value}',
          fontSize: 10
        }
      },
      {
        type: 'value',
        position: 'top',
        gridIndex: 1,
        max: maxPercentage,
        axisLabel: {
          formatter: '{value}%',
          fontSize: 10
        }
      }
    ],
    yAxis: [
      {
        type: 'category',
        data: pollutants,
        gridIndex: 0,
        position: 'right',
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      {
        type: 'category',
        data: pollutants,
        gridIndex: 1,
        position: 'left',
        axisLabel: {
          margin: 30,
          fontSize: 11,
          align: 'center'
        }
      }
    ],
    series: [
      {
        name: 'Measurement Count',
        type: 'bar',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: counts,
        barWidth: '60%',
        label: {
          show: true,
          position: 'left',
          fontSize: 10
        }
      },
      {
        name: 'Cities Covered',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: coverage,
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          fontSize: 10
        }
      }
    ]
  }

  return <ReactECharts option={options} style={{ height: '400px' }} />
}

export default SummaryBarChart 