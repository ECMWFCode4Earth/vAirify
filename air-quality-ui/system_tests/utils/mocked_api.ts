interface forecastAPIResponse {
  base_time: string
  valid_time: string
  location_type: string
  location_name: string
  overall_aqi_level: number
  no2: {
    aqi_level: number
    value: number
  }
  o3: {
    aqi_level: number
    value: number
  }
  pm2_5: {
    aqi_level: number
    value: number
  }
  pm10: {
    aqi_level: number
    value: number
  }
  so2: {
    aqi_level: number
    value: number
  }
}

interface measurementSummaryAPIResponse {
  measurement_base_time: string
  location_type: string
  location_name: string
  overall_aqi_level: {
    mean: number
  }
  no2: {
    mean: {
      aqi_level: number
      value: number
    }
  }
  o3: {
    mean: {
      aqi_level: number
      value: number
    }
  }
  pm2_5: {
    mean: {
      aqi_level: number
      value: number
    }
  }
  pm10: {
    mean: {
      aqi_level: number
      value: number
    }
  }
  so2: {
    mean: {
      aqi_level: number
      value: number
    }
  }
}

export function createForecastAPIResponseData(
  overrides: Partial<forecastAPIResponse> = {},
): object {
  const defaultForecastResponse = {
    base_time: '2024-07-08T00:00:00Z',
    valid_time: '2024-07-08T00:00:00Z',
    location_type: 'city',
    location_name: 'Los Angeles',
    overall_aqi_level: 3,
    no2: {
      aqi_level: 3,
      value: 100.5,
    },
    o3: {
      aqi_level: 3,
      value: 100.5,
    },
    pm2_5: {
      aqi_level: 3,
      value: 22.5,
    },
    pm10: {
      aqi_level: 3,
      value: 45.5,
    },
    so2: {
      aqi_level: 3,
      value: 300.5,
    },
  }

  return { ...defaultForecastResponse, ...overrides }
}

export function createMeasurementSummaryAPIResponseData(
  overrides: Partial<measurementSummaryAPIResponse> = {},
): object {
  const defaultMeasurementSummaryResponse = {
    measurement_base_time: '2024-07-08T00:00:00Z',
    location_type: 'city',
    location_name: 'Los Angeles',
    overall_aqi_level: {
      mean: 3,
    },
    no2: {
      mean: {
        aqi_level: 3,
        value: 100.5,
      },
    },
    o3: {
      mean: {
        aqi_level: 3,
        value: 100.5,
      },
    },
    pm2_5: {
      mean: {
        aqi_level: 3,
        value: 22.5,
      },
    },
    pm10: {
      mean: {
        aqi_level: 3,
        value: 45.5,
      },
    },
    so2: {
      mean: {
        aqi_level: 3,
        value: 300.5,
      },
    },
  }

  return { ...defaultMeasurementSummaryResponse, ...overrides }
}
