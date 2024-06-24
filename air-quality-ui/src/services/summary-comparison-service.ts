import { DateTime } from 'luxon'

import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
  PollutantAverageDataDto,
  PollutantDataDto,
} from './types'
import { PollutantType, pollutantTypes } from '../models'

export interface PollutantData {
  aqiLevel: number
  value: number
  validTime?: string
}

export interface PollutantComparisonData {
  aqiDifference?: number
  forecastData: PollutantData
  measurementData?: PollutantData
}

export type ForecastMeasurementComparison = {
  [P in PollutantType]: PollutantComparisonData
} & {
  forecastOverallAqi: number
  locationName: string
}

const createDefaultComparison = (
  forecastDataForLocation: ForecastResponseDto[],
): ForecastMeasurementComparison => {
  // When no measurements exist for a location, use the latest forecast values
  const defaultForecastRowData = forecastDataForLocation
    .sort(
      ({ valid_time: a }, { valid_time: b }) =>
        DateTime.fromISO(a).toMillis() - DateTime.fromISO(b).toMillis(),
    )
    .slice(-1)[0]
  return {
    forecastOverallAqi: defaultForecastRowData.overall_aqi_level,
    locationName: defaultForecastRowData.location_name,
    ...pollutantTypes.reduce(
      (state, type) => ({
        ...state,
        [type]: {
          forecastData: {
            aqiLevel: defaultForecastRowData[type].aqi_level,
            validTime: defaultForecastRowData.valid_time,
            value: defaultForecastRowData[type].value,
          },
        },
      }),
      {} as Record<PollutantType, PollutantComparisonData>,
    ),
  }
}

const reduceComparisonData = (
  currentComparison: PollutantComparisonData,
  forecastForPollutant: PollutantDataDto,
  measurementForPollutant: PollutantAverageDataDto<PollutantDataDto>,
  comparisonTime: string,
): PollutantComparisonData => {
  const forecastAqiLevel = forecastForPollutant.aqi_level
  const measurementAqiLevel = measurementForPollutant.mean.aqi_level
  const aqiDifference = Math.abs(forecastAqiLevel - measurementAqiLevel)
  const newComparisonData = { ...currentComparison }
  if (
    !newComparisonData.aqiDifference ||
    newComparisonData.aqiDifference < aqiDifference
  ) {
    newComparisonData.aqiDifference = aqiDifference
    newComparisonData.forecastData = {
      aqiLevel: forecastForPollutant.aqi_level,
      value: forecastForPollutant.value,
      validTime: comparisonTime,
    }
    newComparisonData.measurementData = measurementForPollutant
      ? {
          aqiLevel: measurementForPollutant.mean.aqi_level,
          value: measurementForPollutant.mean.value,
        }
      : undefined
  }
  return newComparisonData
}

export const createComparisonData = (
  forecastsByLocation: Record<string, ForecastResponseDto[]>,
  summarizedMeasurementsByLocation: Record<
    string,
    MeasurementSummaryResponseDto[]
  >,
): ForecastMeasurementComparison[] => {
  const allLocations = Object.keys(forecastsByLocation)
  return allLocations.map((location) => {
    const defaultComparisonData = createDefaultComparison(
      forecastsByLocation[location],
    )
    const measurementsForLocation = summarizedMeasurementsByLocation[location]
    // When no measurements exist for a location, we still return forecast data
    if (!measurementsForLocation) {
      return defaultComparisonData
    }
    const forecastDataByTime = forecastsByLocation[location].reduce(
      (map, reading) => map.set(reading.valid_time, reading),
      new Map<string, ForecastResponseDto>(),
    )

    // Find the forecast and measurements with the largest AQI difference
    // for each pollutant at equivalent times
    return measurementsForLocation.reduce<ForecastMeasurementComparison>(
      (state, measurement) => {
        const forecastAtMeasurementTime = forecastDataByTime.get(
          measurement.measurement_base_time,
        )
        pollutantTypes.forEach((type) => {
          const measurementForPollutant = measurement[type]
          if (forecastAtMeasurementTime && measurementForPollutant) {
            state[type] = reduceComparisonData(
              state[type],
              forecastAtMeasurementTime[type],
              measurementForPollutant,
              forecastAtMeasurementTime.valid_time,
            )
          }
        })
        return state
      },
      defaultComparisonData,
    )
  })
}
