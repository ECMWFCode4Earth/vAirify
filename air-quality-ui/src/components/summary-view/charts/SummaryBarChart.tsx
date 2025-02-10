import ReactECharts from 'echarts-for-react'
import { MeasurementCounts } from '../../../services/measurement-data-service'
import { pollutantTypeDisplayShort, PollutantType } from '../../../models'
import { useMemo } from 'react'
import { pollutantColors } from '../../../models/pollutant-colors'

interface SummaryBarChartProps {
  measurementCounts?: MeasurementCounts | null
  totalCities: number
  selectedCity: string | null
}

const SummaryBarChart = ({ selectedCity, measurementCounts, totalCities }: SummaryBarChartProps): JSX.Element => {
  const pollutants: PollutantType[] = ['so2', 'no2', 'o3', 'pm10', 'pm2_5', ]
  
  const getChartData = () => {
    if (!measurementCounts) return { pollutantsList: [], counts: [], coverage: [], maxCount: 0, maxPercentage: 0 }
    
    const pollutantLabels = pollutants.map(p => pollutantTypeDisplayShort[p])

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
      pollutantLabels,
      counts,
      coverage,
      maxCount,
      maxPercentage
    }
  }

  const { pollutantLabels, counts, coverage, maxCount, maxPercentage } = getChartData()

  const filteredData = useMemo(() => {
    if (!selectedCity) {
      return { pollutants, pollutantLabels, counts, coverage, maxCount, maxPercentage }
    }
    
    // Check if the city has any measurements
    if (!measurementCounts?.[selectedCity]) {
      // Return zeros for all pollutants if city has no measurements
      const emptyData = pollutants.map(() => ({
        value: 0,
        itemStyle: { color: '#e0e0e0' }
      }))
      
      return {
        pollutants,
        pollutantLabels,
        counts: emptyData,
        coverage: emptyData,
        maxCount: 1,
        maxPercentage: 1
      }
    }
    
    const newCounts = pollutants.map(pollutant => ({
      value: measurementCounts[selectedCity][pollutant] || 0,
      label: {
        show: true,
        position: 'left',
        fontSize: 10
      }
    }))
    
    // Calculate new maxCount based on selected city's values
    const newMaxCount = Math.max(...newCounts.map(item => item.value))

    // For a selected city, show number of locations with data for each pollutant
    const locationCounts = pollutants.map(pollutant => {
      // Safely access the location count for each pollutant
      const locationCount = measurementCounts[selectedCity]?.[`${pollutant}_locations`] ?? 0
      return {
        value: locationCount,
        label: {
          show: true,
          position: 'right',
          fontSize: 10,
          formatter: locationCount > 0 ? locationCount.toString() : '0'
        }
      }
    })
    
    // Calculate max locations, ensuring it's at least 1 to avoid scale issues
    const maxLocations = Math.max(1, ...locationCounts.map(item => item.value))
    
    return {
      pollutants,
      pollutantLabels,
      counts: newCounts,
      coverage: locationCounts,
      maxCount: newMaxCount || 1, // Use 1 as minimum to avoid empty chart
      maxPercentage: maxLocations
    }
  }, [selectedCity, measurementCounts, pollutants, pollutantLabels, coverage, maxPercentage])

  const getBarColor = (value: number, maxValue: number, isCount: boolean) => {
    if (value === 0) return '#e0e0e0'
    const pollutant = pollutants[Math.floor(value) % pollutants.length]
    return pollutantColors[pollutant]
  }

  const options = {
    title: [
      {
        text: 'Number of Measurements',
        left: '25%',
        top: 0,
        textAlign: 'center',
        textStyle: {
          fontSize: 12
        }
      },
      {
        text: selectedCity ? 'Individual Locations' : 'Cities Covered',
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
      { 
        left: '8%',
        right: '55%',  // Left chart
        bottom: '3%', 
        top: '17%',
      },
      { 
        left: '55%',   // Right chart
        right: '8%',
        bottom: '3%', 
        top: '17%',
      },
      {  // Center grid for labels - use absolute positioning
        left: '48.5%',   // Fixed position in the middle
        width: '10%',
        top: '17%',
        bottom: '3%', 

        z: 999
      }
    ],
    xAxis: [
      {
        type: 'value',
        inverse: true,
        position: 'top',
        gridIndex: 0,
        max: filteredData.maxCount,
        axisLabel: {
          formatter: '{value}',
          fontSize: 10
        }
      },
      {
        type: 'value',
        position: 'top',
        gridIndex: 1,
        max: filteredData.maxPercentage,
        axisLabel: {
          formatter: selectedCity ? '{value}' : '{value}%',
          fontSize: 10
        }
      },
      {  // Add dummy xAxis for center grid
        type: 'value',
        gridIndex: 2,
        show: false
      }
    ],
    yAxis: [
      {
        type: 'category',
        data: filteredData.pollutantLabels,
        gridIndex: 0,
        position: 'center',
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      {
        type: 'category',
        data: filteredData.pollutantLabels,
        gridIndex: 1,
        position: 'center',
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      {  // Center axis for labels
        type: 'category',
        data: filteredData.pollutantLabels,
        gridIndex: 2,
        position: 'center',
        axisLabel: {
          fontSize: 14,
          align: 'center',
          verticalAlign: 'middle',
          inside: true,
          width: '100%'  // Use full width of the grid
        },
        axisLine: { show: false },
        axisTick: { show: false }
      }
    ],
    series: [
      {
        name: 'Measurement Count',
        type: 'bar',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: filteredData.counts.map((item, index) => ({
          ...item,
          itemStyle: {
            color: selectedCity ? 
              (item.value === 0 ? '#e0e0e0' : pollutantColors[pollutants[index]]) :
              pollutantColors[pollutants[index]]
          }
        })),
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
        data: filteredData.coverage.map((item, index) => ({
          ...item,
          itemStyle: {
            color: selectedCity ? 
              (item.value === 0 ? '#e0e0e0' : pollutantColors[pollutants[index]]) :
              pollutantColors[pollutants[index]]
          }
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          fontSize: 10
        }
      },
      {  // Add dummy series for center grid
        type: 'bar',
        xAxisIndex: 2,
        yAxisIndex: 2,
        data: [],
        silent: true
      }
    ]
  }

  return <ReactECharts option={options} style={{ height: '400px' }} />
}

export default SummaryBarChart 