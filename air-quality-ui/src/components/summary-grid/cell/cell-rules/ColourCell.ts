export type PollutantDataDto = {
  [key: string]: {
    aqiLevel: number
    value: number
  }
}

export type Params = {
  column: { colId: string }
  value: number
  data: {
    aqiDifference: string
    forecast: PollutantDataDto
    measurements: PollutantDataDto
  }
}

export default function colourCell(
  showAllColoured: boolean,
  params: Params,
  lowerLimit: number,
  upperLimit?: number,
) {
  const pollutantType: string = params.column.colId.split('.')[1]
  if (!params.value) return false
  const isInColourBand =
    params.value >= lowerLimit && (upperLimit ?? params.value)

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
