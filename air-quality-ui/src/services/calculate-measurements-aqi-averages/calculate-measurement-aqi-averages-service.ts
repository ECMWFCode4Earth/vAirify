import { DateTime } from 'luxon'

import getPollutantIndexLevel from '../aqi-calculator/aqi-calculator-service'
import { MeasurementsResponseDto } from '../types'

interface ITimeBucket {
  measurements: MeasurementsResponseDto[]
  time: DateTime
  time_str: string
  lowerBound: DateTime
  upperBound: DateTime
}

export type SortMeasurementsType = { [timeOffset: number]: ITimeBucket }
export type AverageAqiValues = { measurementDate: string; meanAqiValue: number }

const generatePreAveragedDataStructure = (baseTime: DateTime<boolean>) => {
  const sortedMeasurements: SortMeasurementsType = {}

  for (let i = 0; i <= 5 * 24; i++) {
    const time = baseTime.plus({ hours: i })
    const time_str = time.toISO()

    if (time_str != null) {
      const bucket: ITimeBucket = {
        measurements: [],
        time: time,
        time_str: time_str,
        lowerBound: time.plus({ hours: -0.5 }),
        upperBound: time.plus({ hours: 0.5 }),
      }
      sortedMeasurements[i] = bucket
    }
  }
  return sortedMeasurements
}

export const sortMeasurements = (
  measurementsData: MeasurementsResponseDto[],
  baseTime: DateTime<boolean>,
) => {
  const sortedMeasurements: SortMeasurementsType =
    generatePreAveragedDataStructure(baseTime)
  for (let i = 0; i < measurementsData.length; i++) {
    const measurementDataTime = DateTime.fromISO(
      measurementsData[i].measurement_date,
    )

    for (const timeOffset in sortedMeasurements) {
      const bucket = sortedMeasurements[timeOffset]
      if (
        bucket.lowerBound < measurementDataTime &&
        bucket.upperBound > measurementDataTime
      ) {
        bucket.measurements.push(measurementsData[i])
        break
      }
    }
  }
  return Object.fromEntries(
    Object.entries(sortedMeasurements).filter(
      (sortedMeasurements) => sortedMeasurements[1].measurements.length != 0,
    ),
  )
}

export const averageAqiValues = (measurementsData: SortMeasurementsType) => {
  const averageAqiValues: AverageAqiValues[] = []
  for (const timeOffset in measurementsData) {
    const bucket = measurementsData[timeOffset]
    const measurements = bucket.measurements

    if (measurements.length === 0) {
      continue
    }
    let totalAqi = 0
    for (let i = 0; i < measurements.length; i++) {
      const overallAqiLevel = Math.max(
        getPollutantIndexLevel(measurements[i]['no2'], 'no2'),
        getPollutantIndexLevel(measurements[i]['o3'], 'o3'),
        getPollutantIndexLevel(measurements[i]['pm10'], 'pm10'),
        getPollutantIndexLevel(measurements[i]['pm2_5'], 'pm2_5'),
        getPollutantIndexLevel(measurements[i]['so2'], 'so2'),
      )
      totalAqi = totalAqi + overallAqiLevel
    }
    averageAqiValues.push({
      measurementDate: bucket.time_str,
      meanAqiValue: Math.round(totalAqi / measurements.length),
    })
  }
  return averageAqiValues
}
