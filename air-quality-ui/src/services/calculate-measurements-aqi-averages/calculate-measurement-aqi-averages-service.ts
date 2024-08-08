import { DateTime } from 'luxon'

import { pollutantTypes } from '../../models'
import { getPollutantIndexLevel } from '../aqi-calculator/aqi-calculator-service'
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

const generateBuckets = (baseTime: DateTime<boolean>) => {
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
  const sortedMeasurements: SortMeasurementsType = generateBuckets(baseTime)
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

    interface pollutant_total {
      sum: number
      count: number
    }
    const pollutant_totals: Record<string, pollutant_total> = {}

    pollutantTypes.forEach((pollutant) => {
      pollutant_totals[pollutant] = { sum: 0, count: 0 }
    })

    measurements.forEach((measurement) => {
      pollutantTypes.forEach((pollutant) => {
        if (
          measurement[pollutant] != undefined &&
          measurement[pollutant] != 0
        ) {
          pollutant_totals[pollutant].sum += measurement[pollutant]
          pollutant_totals[pollutant].count++
        }
      })
    })

    const pollutant_aqis: number[] = [0]
    pollutantTypes.forEach((pollutant) => {
      if (pollutant_totals[pollutant].count > 0) {
        const mean_pollutant_value =
          pollutant_totals[pollutant].sum / pollutant_totals[pollutant].count
        const pollutant_aqi = getPollutantIndexLevel(
          mean_pollutant_value,
          pollutant,
        )

        pollutant_aqis.push(pollutant_aqi)
      }
    })

    const overall_aqi = Math.max(...pollutant_aqis)

    averageAqiValues.push({
      measurementDate: bucket.time_str,
      meanAqiValue: overall_aqi,
    })
  }
  return averageAqiValues
}
