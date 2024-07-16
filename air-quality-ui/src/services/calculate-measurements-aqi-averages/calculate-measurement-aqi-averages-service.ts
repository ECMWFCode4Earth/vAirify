import { DateTime } from 'luxon'

import getPollutantIndexLevel from '../aqi-calculator/aqi-calculator-service'
import { MeasurementsResponseDto } from '../types'

const timeBucketDiffInHours = 1
const endTimeInDays = 5

export type SortMeasurementsType = { [x: string]: MeasurementsResponseDto[] }
export type AverageAqiValues = { measurementDate: string; meanAqiValue: number }
type PreAveragedData = { [x: string]: MeasurementsResponseDto[] }

const generatePreAveragedDataStructure = (baseTime: DateTime<boolean>) => {
  const maxDateTime = baseTime.plus({ days: endTimeInDays })
  let currentDateTime = baseTime
  const sortedMeasurements: SortMeasurementsType = {}
  while (currentDateTime <= maxDateTime) {
    const time: string | null = currentDateTime.toISO()
    if (time != null) {
      sortedMeasurements[time] = []
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

export const sortMeasurements = (
  measurementsData: MeasurementsResponseDto[],
  baseTime: DateTime<boolean>,
) => {
  const preAveragedData: PreAveragedData =
    generatePreAveragedDataStructure(baseTime)
  for (let i = 0; i < measurementsData.length; i++) {
    for (const time in preAveragedData) {
      const preAveragedDataDate = DateTime.fromISO(time.toString())
      const endpointBefore = DateTime.fromISO(time.toString()).minus({
        hours: timeBucketDiffInHours / 2,
      })
      const endpointAfter = DateTime.fromISO(time.toString()).plus({
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
        preAveragedData[time].push(measurementsData[i])
        break
      }
    }
  }

  return Object.fromEntries(
    Object.entries(preAveragedData).filter(
      (timeSection) => timeSection[1].length != 0,
    ),
  )
}

export const averageAqiValues = (measurementsData: SortMeasurementsType) => {
  const averageAqiValues: AverageAqiValues[] = []
  for (const time in measurementsData) {
    if (measurementsData[time].length === 0) {
      continue
    }
    let totalAqi = 0
    for (let i = 0; i < measurementsData[time].length; i++) {
      const overallAqiLevel = Math.max(
        getPollutantIndexLevel(measurementsData[time][i]['no2'], 'no2'),
        getPollutantIndexLevel(measurementsData[time][i]['o3'], 'o3'),
        getPollutantIndexLevel(measurementsData[time][i]['pm10'], 'pm10'),
        getPollutantIndexLevel(measurementsData[time][i]['pm2_5'], 'pm2_5'),
        getPollutantIndexLevel(measurementsData[time][i]['so2'], 'so2'),
      )
      totalAqi = totalAqi + overallAqiLevel
    }
    averageAqiValues.push({
      measurementDate: time,
      meanAqiValue: Math.round(totalAqi / measurementsData[time].length),
    })
  }
  return averageAqiValues
}
