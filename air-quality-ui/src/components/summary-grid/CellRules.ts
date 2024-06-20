type Params = {
  column: { colId: string }
  value: number
  data: {
    aqiDifference: number
    forecast: { [x: string]: { aqiLevel: number } }
    measurements: { [x: string]: { aqiLevel: number } }
  }
}

function colourField(params: Params, lowerLimit: number, upperLimit?: number) {
  const columnType = params.column.colId.split('.')
  const measurementAQIValue =
    columnType[0] === 'forecast'
      ? params.data.forecast[columnType[1]].aqiLevel
      : params.data.aqiDifference ===
        params.data.measurements[columnType[1]].aqiLevel

  const aqiMatchesDifference = params.data.aqiDifference === measurementAQIValue

  const isInColourBand =
    params.value >= lowerLimit && (upperLimit ?? params.value)
  return aqiMatchesDifference ? isInColourBand : false
}

export const cellRules = {
  pm2_5: {
    'cell-very-good': (params: Params) => colourField(params, 0, 10),
    'cell-good': (params: Params) => colourField(params, 10, 20),
    'cell-medium': (params: Params) => colourField(params, 20, 25),
    'cell-poor': (params: Params) => colourField(params, 25, 50),
    'cell-very-poor': (params: Params) => colourField(params, 50, 75),
    'cell-extremely-poor': (params: Params) => colourField(params, 75, 800),
    'cell-error': (params: Params) => colourField(params, 800),
  },

  pm10: {
    'cell-very-good': (params: { value: number }) =>
      params.value > 0 && params.value <= 20,
    'cell-good': (params: { value: number }) =>
      params.value > 20 && params.value <= 40,
    'cell-medium': (params: { value: number }) =>
      params.value > 40 && params.value <= 50,
    'cell-poor': (params: { value: number }) =>
      params.value > 50 && params.value <= 100,
    'cell-very-poor': (params: { value: number }) =>
      params.value > 100 && params.value <= 150,
    'cell-extremely-poor': (params: { value: number }) =>
      params.value > 150 && params.value <= 1200,
    'cell-error': (params: { value: number }) => params.value > 1200,
  },

  so2: {
    'cell-very-good': (params: { value: number }) =>
      params.value > 0 && params.value <= 100,
    'cell-good': (params: { value: number }) =>
      params.value > 100 && params.value <= 200,
    'cell-medium': (params: { value: number }) =>
      params.value > 200 && params.value <= 350,
    'cell-poor': (params: { value: number }) =>
      params.value > 350 && params.value <= 500,
    'cell-very-poor': (params: { value: number }) =>
      params.value > 500 && params.value <= 750,
    'cell-extremely-poor': (params: { value: number }) =>
      params.value > 750 && params.value <= 1250,
    'cell-error': (params: { value: number }) => params.value > 1250,
  },

  no2: {
    'cell-very-good': (params: { value: number }) =>
      params.value > 0 && params.value <= 40,
    'cell-good': (params: { value: number }) =>
      params.value > 40 && params.value <= 90,
    'cell-medium': (params: { value: number }) =>
      params.value > 90 && params.value <= 120,
    'cell-poor': (params: { value: number }) =>
      params.value > 120 && params.value <= 230,
    'cell-very-poor': (params: { value: number }) =>
      params.value > 230 && params.value <= 340,
    'cell-extremely-poor': (params: { value: number }) =>
      params.value > 340 && params.value <= 1000,
    'cell-error': (params: { value: number }) => params.value > 1000,
  },

  o3: {
    'cell-very-good': (params: { value: number }) =>
      params.value > 0 && params.value <= 50,
    'cell-good': (params: { value: number }) =>
      params.value > 50 && params.value <= 100,
    'cell-medium': (params: { value: number }) =>
      params.value > 100 && params.value <= 130,
    'cell-poor': (params: { value: number }) =>
      params.value > 130 && params.value <= 240,
    'cell-very-poor': (params: { value: number }) =>
      params.value > 240 && params.value <= 380,
    'cell-extremely-poor': (params: { value: number }) =>
      params.value > 380 && params.value <= 800,
    'cell-error': (params: { value: number }) => params.value > 800,
  },
}
