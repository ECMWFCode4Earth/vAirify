import ReactECharts from 'echarts-for-react'
import { useState } from 'react'
import { ForecastResponseDto, MeasurementSummaryResponseDto } from '../../../services/types'
import { PollutantType, pollutantTypeDisplay, pollutantTypeDisplayShort } from '../../../models'
import { DateTime } from 'luxon'

interface SummaryScatterChartProps {
  title: string
  summarizedMeasurements?: Record<string, MeasurementSummaryResponseDto[]>
  forecast?: Record<string, ForecastResponseDto[]>
  selectedCity: string | null
}

const pollutantColors: Record<PollutantType, string> = {
  pm2_5: '#1f77b4',  // blue
  pm10: '#ff7f0e',   // orange
  no2: '#2ca02c',    // green
  o3: '#d62728',     // red
  so2: '#9467bd'     // purple
}

const SummaryScatterChart = ({ 
  title, 
  summarizedMeasurements, 
  forecast,
  selectedCity 
}: SummaryScatterChartProps): JSX.Element => {
  const [selectedPollutants, setSelectedPollutants] = useState<Set<PollutantType>>(
    new Set(['pm2_5', 'pm10', 'o3', 'no2', 'so2'])
  )

  const togglePollutant = (pollutant: PollutantType) => {
    const newSelection = new Set(selectedPollutants)
    if (newSelection.has(pollutant)) {
      newSelection.delete(pollutant)
    } else {
      newSelection.add(pollutant)
    }
    setSelectedPollutants(newSelection)
  }

  const getChartData = () => {
    if (!summarizedMeasurements || !forecast) return []

    const pollutants: PollutantType[] = ['pm2_5', 'pm10', 'o3', 'no2', 'so2']
      .filter(p => selectedPollutants.has(p))
    
    return Object.entries(summarizedMeasurements).flatMap(([cityName, measurements]) => {
      if (selectedCity && selectedCity !== cityName) return []
      
      const cityForecasts = forecast[cityName] || []
      
      return measurements.flatMap(measurement => {
        const matchingForecast = cityForecasts.find(
          f => f.valid_time === measurement.measurement_base_time
        )
        if (!matchingForecast) return []

        return pollutants.map(pollutant => {
          const measuredValue = measurement[pollutant]?.mean?.value
          const forecastValue = matchingForecast[pollutant]?.value
          
          if (measuredValue === undefined || forecastValue === undefined) return null
          
          return {
            value: [measuredValue, forecastValue],
            name: cityName,
            pollutant: pollutant,
            timestamp: measurement.measurement_base_time,
            itemStyle: {
              color: pollutantColors[pollutant]
            }
          }
        }).filter(item => item !== null)
      })
    })
  }

  const data = getChartData()
  
  // Calculate axis bounds based on data
  const maxValue = Math.max(
    ...data.map(point => Math.max(point.value[0], point.value[1])),
    0
  )
  const axisMax = Math.ceil(maxValue * 1.1) // Add 10% padding

  const options = {
    animation: false,  // Disable transitions
    title: {
      text: title,
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 12
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        const timestamp = DateTime.fromISO(params.data.timestamp).toFormat('dd MMM HH:mm')
        return `${params.data.name}<br/>
                ${pollutantTypeDisplay[params.data.pollutant]}<br/>
                Time: ${timestamp} UTC<br/>
                Measured: ${params.value[0].toFixed(1)} µg/m³<br/>
                Forecast: ${params.value[1].toFixed(1)} µg/m³`
      }
    },
    grid: {
      left: '12%',
      right: '20%', // Make room for buttons
      bottom: '14%',
      top: '10%'
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none',
        minSpan: 1
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'none',
        minSpan: 1
      }
    ],
    xAxis: {
      type: 'value',
      name: 'Measured (µg/m³)',
      nameLocation: 'middle',
      nameGap: 25,
      min: 0,
      max: axisMax,
      axisLabel: {
        formatter: '{value}'
      }
    },
    yAxis: {
      type: 'value',
      name: 'Forecast (µg/m³)',
      nameLocation: 'middle',
      nameGap: 35,
      min: 0,
      max: axisMax,
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        type: 'scatter',
        data: data,
        symbolSize: 8,
        itemStyle: {
          opacity: 0.7
        }
      },
      {
        type: 'line',
        showSymbol: false,
        data: [[0, 0], [axisMax, axisMax]], // Diagonal line from origin to max
        lineStyle: {
          color: '#999',
          type: 'dashed'
        },
        tooltip: {
          show: false
        }
      }
    ]
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <ReactECharts option={options} style={{ height: '100%' }} />
      <div style={{
        position: 'absolute',
        right: '2%',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {Object.entries(pollutantColors).map(([pollutant, color]) => (
          <button
            key={pollutant}
            onClick={() => togglePollutant(pollutant as PollutantType)}
            style={{
              backgroundColor: selectedPollutants.has(pollutant as PollutantType) ? color : '#fff',
              color: selectedPollutants.has(pollutant as PollutantType) ? '#fff' : '#000',
              border: `2px solid ${color}`,
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px',
              opacity: selectedPollutants.has(pollutant as PollutantType) ? 1 : 0.6
            }}
          >
            {pollutantTypeDisplayShort[pollutant as PollutantType]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SummaryScatterChart 