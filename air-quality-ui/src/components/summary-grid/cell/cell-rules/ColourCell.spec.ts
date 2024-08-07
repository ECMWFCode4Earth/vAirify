import colourCell from './ColourCell'

describe('Colour Cell', () => {
  it('The most impactful forecast and measurement pairs are coloured when showAllColoured is false', () => {
    const params = {
      column: { colId: 'forecast.pm2_5' },
      value: 5,
      data: {
        aqiDifference: '-5',
        forecast: {
          pm2_5: {
            value: 5,
            aqiLevel: 1,
          },
        },
        measurements: {
          pm2_5: {
            value: 5,
            aqiLevel: 6,
          },
        },
      },
    }
    const result = colourCell(false, params, 1)
    expect(result).toBeTruthy()
  })

  it('The least impactful forecast and measurement pairs are not coloured when showAllColoured is false', () => {
    const params = {
      column: { colId: 'forecast.pm2_5' },
      value: 1.0,
      data: {
        aqiDifference: '-5',
        forecast: {
          pm2_5: {
            value: 1,
            aqiLevel: 1,
          },
        },
        measurements: {
          pm2_5: {
            value: 30,
            aqiLevel: 3,
          },
        },
      },
    }
    const result = colourCell(false, params, 1)
    expect(result).toBeFalsy()
  })

  it('if showAllColoured is false and there is no difference between overall aqi diff and forecast measurement aqi diff return false', () => {
    const params = {
      column: { colId: 'forecast.pm2_5' },
      value: 1,
      data: {
        aqiDifference: '0',
        forecast: {
          pm2_5: {
            value: 1,
            aqiLevel: 1,
          },
        },
        measurements: {
          pm2_5: {
            value: 1,
            aqiLevel: 1,
          },
        },
      },
    }
    const result = colourCell(false, params, 1)
    expect(result).toBeFalsy()
  })

  it('if showAllColoured is true, colour all cells regardless of impact', () => {
    const params = {
      column: { colId: 'forecast.pm2_5' },
      value: 1.0,
      data: {
        aqiDifference: '-5',
        forecast: {
          pm2_5: {
            value: 1,
            aqiLevel: 1,
          },
        },
        measurements: {
          pm2_5: {
            value: 1,
            aqiLevel: 1,
          },
        },
      },
    }
    const result = colourCell(true, params, 1)
    expect(result).toBeTruthy()
  })

  it('if measurements is undefined do not colour (return false)', () => {
    const params = {
      column: { colId: 'forecast.pm2_5' },
      value: 1.0,
      data: {
        aqiDifference: '-5',
        forecast: {
          pm2_5: {
            value: 1,
            aqiLevel: 1,
          },
        },
        measurements: undefined,
      },
    }
    const result = colourCell(false, params, 1)
    expect(result).toBeFalsy()
  })

  it('if the pollutant is not found in measurements object return false', () => {
    const params = {
      column: { colId: 'forecast.pm2_5' },
      value: 1.0,
      data: {
        aqiDifference: '-5',
        forecast: {
          pm2_5: {
            value: 1,
            aqiLevel: 1,
          },
        },
        measurements: {},
      },
    }
    const result = colourCell(false, params, 1)
    expect(result).toBeFalsy()
  })

  it('if current is measurement column returns correctly', () => {
    const params = {
      column: { colId: 'measurement.pm2_5' },
      value: 1.0,
      data: {
        aqiDifference: '-5',
        forecast: {
          pm2_5: {
            value: 1,
            aqiLevel: 1,
          },
        },
        measurements: {},
      },
    }
    const result = colourCell(false, params, 1)
    expect(result).toBeFalsy()
  })
})
