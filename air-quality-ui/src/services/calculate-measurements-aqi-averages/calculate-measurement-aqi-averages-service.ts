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
        bucket.lowerBound <= measurementDataTime &&
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

    let no2_total = 0
    let no2_num = 0
    let pm25_total = 0
    let pm25_num = 0
    let pm10_total = 0
    let pm10_num = 0
    let so2_total = 0
    let so2_num = 0
    let o3_total = 0
    let o3_num = 0

    measurements.forEach((measurement) => {
      if (measurement['no2'] != undefined && measurement['no2'] != 0) {
        no2_total += measurement['no2']
        no2_num++
      }
      if (measurement['so2'] != undefined && measurement['so2'] != 0) {
        so2_total += measurement['so2']
        so2_num++
      }
      if (measurement['o3'] != undefined && measurement['o3'] != 0) {
        o3_total += measurement['o3']
        o3_num++
      }
      if (measurement['pm2_5'] != undefined && measurement['pm2_5'] != 0) {
        pm25_total += measurement['pm2_5']
        pm25_num++
      }
      if (measurement['pm10'] != undefined && measurement['pm10'] != 0) {
        pm10_total += measurement['pm10']
        pm10_num++
      }
    })

    const overallAqiLevel = Math.max(
      no2_num == 0 ? 0 : getPollutantIndexLevel(no2_total / no2_num, 'no2'),
      so2_num == 0 ? 0 : getPollutantIndexLevel(so2_total / so2_num, 'so2'),
      o3_num == 0 ? 0 : getPollutantIndexLevel(o3_total / o3_num, 'o3'),
      pm25_num == 0 ? 0 : getPollutantIndexLevel(pm25_total / pm25_num, 'pm25'),
      pm10_num == 0 ? 0 : getPollutantIndexLevel(pm10_total / pm10_num, 'pm10'),
    )

    averageAqiValues.push({
      measurementDate: bucket.time_str,
      meanAqiValue: overallAqiLevel,
    })
  }
  return averageAqiValues
}
