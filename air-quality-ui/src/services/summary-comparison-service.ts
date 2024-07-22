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
  const reducedComparisonData = { ...currentComparison }

  if (
    !reducedComparisonData.aqiDifference ||
    reducedComparisonData.aqiDifference < aqiDifference ||
    (reducedComparisonData.aqiDifference == aqiDifference &&
      reducedComparisonData.forecastData.aqiLevel <
        forecastForPollutant.aqi_level)
  ) {
    reducedComparisonData.aqiDifference = aqiDifference
    reducedComparisonData.forecastData = {
      aqiLevel: forecastForPollutant.aqi_level,
      value: forecastForPollutant.value,
      validTime: comparisonTime,
    }
    reducedComparisonData.measurementData = measurementForPollutant
      ? {
          aqiLevel: measurementForPollutant.mean.aqi_level,
          value: measurementForPollutant.mean.value,
        }
      : undefined
  }
  return reducedComparisonData
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

type SummaryDetail = {
  aqiLevel?: number
} & {
  [P in PollutantType]?: { value: number; time?: string; aqiLevel: number }
}

interface SummaryRow {
  locationName: string
  forecast: SummaryDetail
  measurements?: SummaryDetail
  aqiDifference?: string
}

function getPerformanceSymbol(
  forecastAQILevel: number,
  measurementsAQILevel: number,
) {
  if (forecastAQILevel > measurementsAQILevel) {
    return '+'
  } else if (forecastAQILevel === measurementsAQILevel) {
    return ''
  } else {
    return '-'
  }
}

export const createSummaryRow = ({
  locationName,
  ...data
}: ForecastMeasurementComparison): SummaryRow => {
  const row: SummaryRow = {
    locationName,
    forecast: {
      aqiLevel: data.forecastOverallAqi,
    },
  }

  pollutantTypes.forEach((pollutantType) => {
    const { forecastData, measurementData } = data[pollutantType]
    row.forecast[pollutantType] = {
      value: parseFloat(forecastData.value.toFixed(1)),
      aqiLevel: forecastData.aqiLevel,
      time: forecastData.validTime,
    }
    if (measurementData) {
      row.measurements = {
        ...row.measurements,
        [pollutantType]: {
          value: parseFloat(measurementData.value.toFixed(1)),
          aqiLevel: measurementData.aqiLevel,
        },
      }
      const newDifference = Math.abs(
        measurementData.aqiLevel - forecastData.aqiLevel,
      )
      const currentDifference = Math.abs(parseInt(row.aqiDifference ?? '0'))
      const currentForecastAqi = row.forecast.aqiLevel!

      if (
        !row.aqiDifference ||
        newDifference > currentDifference ||
        (newDifference == currentDifference &&
          forecastData.aqiLevel > currentForecastAqi)
      ) {
        const currentDifferenceWithSymbol =
          getPerformanceSymbol(
            forecastData.aqiLevel,
            measurementData.aqiLevel,
          ) + newDifference

        row.aqiDifference = currentDifferenceWithSymbol
        row.forecast.aqiLevel = forecastData.aqiLevel
        row.measurements.aqiLevel = measurementData.aqiLevel
      }
    }
  })

  return row
}
