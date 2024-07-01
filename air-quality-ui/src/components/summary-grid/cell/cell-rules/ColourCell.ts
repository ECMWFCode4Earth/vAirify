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

export default function colourCell(
  showAllColoured: boolean,
  params: Params,
  lowerLimit: number,
  upperLimit?: number,
): boolean {
  const pollutantType: string = params.column.colId.split('.')[1]
  if (!params.value) return false

  if (upperLimit === undefined && showAllColoured) {
    return params.value >= lowerLimit
  }

  let isInColourBand
  if (upperLimit === undefined) {
    isInColourBand = params.value >= lowerLimit
  } else {
    isInColourBand = params.value >= lowerLimit && params.value <= upperLimit
  }

  if (showAllColoured) return isInColourBand
  if (!params.data.measurements || !params.data.measurements[pollutantType])
    return false

  const aqiDifference = Math.abs(
    params.data.forecast[pollutantType].aqiLevel -
      params.data.measurements[pollutantType].aqiLevel,
  )

  if (params.data.aqiDifference === '0') return false

  const aqiMatchesDifference =
    parseInt(params.data.aqiDifference.split('')[1]) === aqiDifference

  return aqiMatchesDifference ? isInColourBand : false
}
