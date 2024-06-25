type PollutantDataDto = {
  [key: string]: {
    aqiLevel: number
    value: number
  }
}

type Params = {
  column: { colId: string }
  value: number
  data: {
    aqiDifference: number
    forecast: PollutantDataDto
    measurements: PollutantDataDto
  }
}

function colourField(
  showAllColoured: boolean,
  params: Params,
  lowerLimit: number,
  upperLimit?: number,
) {
  const isInColourBand =
    params.value >= lowerLimit && (upperLimit ?? params.value)

  if (showAllColoured) return isInColourBand

  const pollutantType: string = params.column.colId.split('.')[1]
  if (!params.value || !params.data.measurements[pollutantType]) return false

  const aqiDifference = Math.abs(
    params.data.forecast[pollutantType].aqiLevel -
      params.data.measurements[pollutantType].aqiLevel,
  )

  if (params.data.aqiDifference === 0) return false

  const aqiMatchesDifference = params.data.aqiDifference === aqiDifference

  return aqiMatchesDifference ? isInColourBand : false
}

export default function cellRules(showAllColoured: boolean) {
  return {
    pm2_5: {
      'cell-very-good': (params: Params) =>
        colourField(showAllColoured, params, 0, 10),
      'cell-good': (params: Params) =>
        colourField(showAllColoured, params, 10, 20),
      'cell-medium': (params: Params) =>
        colourField(showAllColoured, params, 20, 25),
      'cell-poor': (params: Params) =>
        colourField(showAllColoured, params, 25, 50),
      'cell-very-poor': (params: Params) =>
        colourField(showAllColoured, params, 50, 75),
      'cell-extremely-poor': (params: Params) =>
        colourField(showAllColoured, params, 75, 800),
      'cell-error': (params: Params) =>
        colourField(showAllColoured, params, 800),
    },

    pm10: {
      'cell-very-good': (params: Params) =>
        colourField(showAllColoured, params, 0, 20),
      'cell-good': (params: Params) =>
        colourField(showAllColoured, params, 20, 40),
      'cell-medium': (params: Params) =>
        colourField(showAllColoured, params, 40, 50),
      'cell-poor': (params: Params) =>
        colourField(showAllColoured, params, 50, 100),
      'cell-very-poor': (params: Params) =>
        colourField(showAllColoured, params, 100, 150),
      'cell-extremely-poor': (params: Params) =>
        colourField(showAllColoured, params, 150, 1200),
      'cell-error': (params: Params) =>
        colourField(showAllColoured, params, 1200),
    },

    so2: {
      'cell-very-good': (params: Params) =>
        colourField(showAllColoured, params, 0, 100),
      'cell-good': (params: Params) =>
        colourField(showAllColoured, params, 100, 200),
      'cell-medium': (params: Params) =>
        colourField(showAllColoured, params, 200, 350),
      'cell-poor': (params: Params) =>
        colourField(showAllColoured, params, 350, 500),
      'cell-very-poor': (params: Params) =>
        colourField(showAllColoured, params, 500, 750),
      'cell-extremely-poor': (params: Params) =>
        colourField(showAllColoured, params, 750, 1250),
      'cell-error': (params: Params) =>
        colourField(showAllColoured, params, 1250),
    },

    no2: {
      'cell-very-good': (params: Params) =>
        colourField(showAllColoured, params, 0, 40),
      'cell-good': (params: Params) =>
        colourField(showAllColoured, params, 40, 90),
      'cell-medium': (params: Params) =>
        colourField(showAllColoured, params, 90, 120),
      'cell-poor': (params: Params) =>
        colourField(showAllColoured, params, 120, 230),
      'cell-very-poor': (params: Params) =>
        colourField(showAllColoured, params, 230, 340),
      'cell-extremely-poor': (params: Params) =>
        colourField(showAllColoured, params, 340, 1000),
      'cell-error': (params: Params) =>
        colourField(showAllColoured, params, 1000),
    },

    o3: {
      'cell-very-good': (params: Params) =>
        colourField(showAllColoured, params, 0, 50),
      'cell-good': (params: Params) =>
        colourField(showAllColoured, params, 50, 100),
      'cell-medium': (params: Params) =>
        colourField(showAllColoured, params, 100, 130),
      'cell-poor': (params: Params) =>
        colourField(showAllColoured, params, 130, 240),
      'cell-very-poor': (params: Params) =>
        colourField(showAllColoured, params, 240, 380),
      'cell-extremely-poor': (params: Params) =>
        colourField(showAllColoured, params, 380, 800),
      'cell-error': (params: Params) =>
        colourField(showAllColoured, params, 800),
    },
  }
}
