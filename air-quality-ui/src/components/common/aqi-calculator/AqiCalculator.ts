type AqiRangesByPollutantType = {
  [key: string]: number[]
}
const aqiRangesByPollutant: AqiRangesByPollutantType = {
  o3: [50, 100, 130, 240, 380, 800],
  no2: [40, 90, 120, 230, 340, 1000],
  so2: [100, 200, 350, 500, 750, 1250],
  pm10: [20, 40, 50, 100, 150, 1200],
  pm2_5: [10, 20, 25, 50, 75, 800],
}

export default function getPollutantIndexLevel(
  value: number | undefined,
  pollutantType: string,
) {
  if (value === undefined) {
    return 0
  }
  const ranges = aqiRangesByPollutant[pollutantType]
  for (let aqiValue = 0; ranges.length; aqiValue++) {
    if (value <= ranges[aqiValue]) {
      return aqiValue
    }
  }
  return ranges.length
}
