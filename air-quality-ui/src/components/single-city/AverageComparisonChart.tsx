import ReactECharts from 'echarts-for-react'

import classes from './AverageComparisonChart.module.css'
import { convertToLocalTime, xAxisFormat } from '../../services/echarts-service'
import {
  ForecastResponseDto,
  MeasurementsResponseDto,
} from '../../services/types'
import getPollutantIndexLevel from '../common/aqi-calculator/AqiCalculator'
type MeasurementsAveraged = (string | number)[]
function getChartOptions(
  forecastData?: ForecastResponseDto[],
  measurementsAveragedData?: MeasurementsAveraged[],
) {
  return {
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: xAxisFormat,
      },
    },
    yAxis: {
      type: 'value',
      name: 'AQI',
      max: 6,
      nameGap: 30,
      nameLocation: 'middle',
    },
    series: [
      {
        data: forecastData?.map((f) => [
          convertToLocalTime(f.valid_time),
          f.overall_aqi_level,
        ]),
        type: 'line',
        name: 'Forecast',
      },
      {
        data: measurementsAveragedData?.map((f) => [
          convertToLocalTime(f[0].toString()),
          f[1],
        ]),
        type: 'line',
        name: 'Measurement',
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
    legend: {},
  }
}

interface AverageComparisonChartProps {
  forecastData?: ForecastResponseDto[]
  measurementsData?: MeasurementsResponseDto[]
}
function sortMeasurements(measurementsData: MeasurementsResponseDto[]) {
  const preAveragedData: MeasurementsResponseDto[][] = []
  for (let i = 0; i < measurementsData.length; i++) {
    let foundMeasurement = false
    for (let z = 0; z < preAveragedData.length; z++) {
      if (
        preAveragedData[z].some(
          (measurement) =>
            measurement.measurement_date ===
            measurementsData[i].measurement_date,
        )
      ) {
        foundMeasurement = true
        preAveragedData[z].push(measurementsData[i])
        break
      }
    }
    if (!foundMeasurement) {
      preAveragedData.push([measurementsData[i]])
    }
  }
  return preAveragedData
}

function averageAqiValues(measurementsData: MeasurementsResponseDto[][]) {
  const averageAqiValues = []
  for (let i = 0; i < measurementsData.length; i++) {
    let addition = 0
    for (let x = 0; x < measurementsData[i].length; x++) {
      let overallAqiLevel = 0
      overallAqiLevel = Math.max(
        getPollutantIndexLevel(measurementsData[i][x].no2, 'no2'),
        getPollutantIndexLevel(measurementsData[i][x].o3, 'o3'),
        getPollutantIndexLevel(measurementsData[i][x].pm10, 'pm10'),
        getPollutantIndexLevel(measurementsData[i][x].pm2_5, 'pm2_5'),
        getPollutantIndexLevel(measurementsData[i][x].so2, 'so2'),
      )

      addition = addition + overallAqiLevel
    }
    averageAqiValues.push([
      measurementsData[i][0].measurement_date,
      addition / measurementsData[i].length,
    ])
  }
  return averageAqiValues
}

export const AverageComparisonChart = (
  props: AverageComparisonChartProps,
): JSX.Element => {
  let measurementsAveragedData
  console.log('measurementsData')
  console.log(props.measurementsData)
  if (props.measurementsData) {
    const sortedMeasurements = sortMeasurements(props.measurementsData)
    console.log('sortedMeasurements')
    console.log(sortedMeasurements)
    measurementsAveragedData = averageAqiValues(sortedMeasurements)
  }
  console.log('measurementsAveragedData')
  console.log(measurementsAveragedData)
  return (
    <ReactECharts
      className={classes['chart']}
      option={getChartOptions(props.forecastData, measurementsAveragedData)}
      notMerge
    />
  )
}
