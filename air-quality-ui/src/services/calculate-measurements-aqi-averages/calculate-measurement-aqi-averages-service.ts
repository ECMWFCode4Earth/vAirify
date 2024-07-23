import { DateTime } from 'luxon'

import getPollutantIndexLevel from '../aqi-calculator/aqi-calculator-service'
import { MeasurementsResponseDto } from '../types'

const timeBucketDiffInHours = 1
const endTimeInDays = 5

export type AverageAqiValues = { measurementDate: string; meanAqiValue: number }
type PreAveragedData = {
  [x: string]: { totalAqiValue: number; entryCount: number }
}

const generatePreAveragedDataStructure = (baseTime: DateTime<boolean>) => {
  const maxDateTime = baseTime.plus({ days: endTimeInDays })
  let currentDateTime = baseTime
  const sortedMeasurements: PreAveragedData = {}
  while (currentDateTime <= maxDateTime) {
    const time: string | null = currentDateTime.toISO()
    if (time != null) {
      sortedMeasurements[time] = { totalAqiValue: 0, entryCount: 0 }
    }
    currentDateTime = currentDateTime.plus({ hours: timeBucketDiffInHours })
  }
  return sortedMeasurements
}

const isDateBetweenRange = (
  date: DateTime<boolean>,
  startDate: DateTime<boolean>,
  endDate: DateTime<boolean>,
) => {
  return date >= startDate && date < endDate
}

const average = (preAveragedData: PreAveragedData) => {
  const averageAqiValues: AverageAqiValues[] = []
  for (const [date, data] of Object.entries(preAveragedData)) {
    if (data.entryCount === 0) {
      continue
    }
    averageAqiValues.push({
      measurementDate: date,
      meanAqiValue: Math.round(data.totalAqiValue / data.entryCount),
    })
  }
  return averageAqiValues
}

export const averageAqiValues = (
  measurementsData: MeasurementsResponseDto[],
  baseTime: DateTime<boolean>,
) => {
  const preAveragedData: PreAveragedData =
    generatePreAveragedDataStructure(baseTime)
  for (let i = 0; i < measurementsData.length; i++) {
    for (const time in preAveragedData) {
      const preAveragedDataDate = DateTime.fromISO(time)
      const endpointBefore = DateTime.fromISO(time).minus({
        hours: timeBucketDiffInHours / 2,
      })
      const endpointAfter = DateTime.fromISO(time).plus({
        hours: timeBucketDiffInHours / 2,
      })
      const measurementDataTime = DateTime.fromISO(
        measurementsData[i].measurement_date,
      )
      if (
        isDateBetweenRange(
          measurementDataTime,
          endpointBefore,
          preAveragedDataDate,
        ) ||
        isDateBetweenRange(
          measurementDataTime,
          preAveragedDataDate,
          endpointAfter,
        )
      ) {
        const overallAqiLevel = Math.max(
          getPollutantIndexLevel(measurementsData[i]['no2'], 'no2'),
          getPollutantIndexLevel(measurementsData[i]['o3'], 'o3'),
          getPollutantIndexLevel(measurementsData[i]['pm10'], 'pm10'),
          getPollutantIndexLevel(measurementsData[i]['pm2_5'], 'pm2_5'),
          getPollutantIndexLevel(measurementsData[i]['so2'], 'so2'),
        )
        preAveragedData[time].entryCount++
        preAveragedData[time].totalAqiValue += overallAqiLevel
        break
      }
    }
  }
  return average(preAveragedData)
}
