export type Measurements = {
  base_time: string
  valid_time: string
  location_name: string
  location_type: string
  overall_aqi_level: number

  no2: {
    aqi_level: number
    value: number
  }
  o3: {
    aqi_level: number
    value: number
  }
  pm10: {
    aqi_level: number
    value: number
  }
  pm2_5: {
    aqi_level: number
    value: number
  }
  so2: {
    aqi_level: number
    value: number
  }
}
