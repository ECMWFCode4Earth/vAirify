export type PollutantData = {
  [key: string]: {
    aqiLevel: number
    value: number
  }
}

export type Params = {
  column: { colId: string }
  value: number | undefined
  data: {
    aqiDifference: string
    forecast: PollutantData
    measurements: PollutantData | undefined
  }
}

type AqiValues = {
  currentFieldAqiValue: number
  otherFieldAqiValue: number
}

function fetchAqiValue(params: Params): AqiValues {
  const columnDetails = params.column.colId.split('.')
  const isForecastField = columnDetails[0] === 'forecast'
  const forecastAQIValue = params.data.forecast[columnDetails[1]].aqiLevel
  let measurementAqiValue = -1

  if (params.data.measurements && params.data.measurements[columnDetails[1]]) {
    measurementAqiValue = params.data.measurements[columnDetails[1]].aqiLevel
  }

  if (isForecastField) {
    return {
      currentFieldAqiValue: forecastAQIValue,
      otherFieldAqiValue: measurementAqiValue,
    }
  }

  return {
    currentFieldAqiValue: measurementAqiValue,
    otherFieldAqiValue: forecastAQIValue,
  }
}

export default function colourCell(
  showAllColoured: boolean,
  params: Params,
  targetAqiValue: number,
): boolean {
  const aqiValues = fetchAqiValue(params)
  if (!params.value || aqiValues.currentFieldAqiValue === -1) {
    return false
  }

  const isInColourBand = targetAqiValue === aqiValues.currentFieldAqiValue
  if (showAllColoured) {
    return isInColourBand
  }

  if (aqiValues.otherFieldAqiValue === -1) {
    return false
  }

  const aqiDifference = Math.abs(
    aqiValues.currentFieldAqiValue - aqiValues.otherFieldAqiValue,
  )
  if (params.data.aqiDifference === '0') {
    return false
  }

  const aqiMatchesDifference =
    Math.abs(parseInt(params.data.aqiDifference)) === aqiDifference
  return aqiMatchesDifference ? isInColourBand : false
}
