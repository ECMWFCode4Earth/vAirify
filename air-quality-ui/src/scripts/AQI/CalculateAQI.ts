type index = [number, number]
type aqiRangesByPollutantType = {
  [key: string]: index[]
}
const aqiRangesByPollutant: aqiRangesByPollutantType = {
  o3: [
    [1, 50],
    [2, 100],
    [3, 130],
    [4, 240],
    [5, 380],
    [6, 800],
  ],
  no2: [
    [1, 40],
    [2, 90],
    [3, 120],
    [4, 230],
    [5, 340],
    [6, 1000],
  ],
  so2: [
    [1, 100],
    [2, 200],
    [3, 350],
    [4, 500],
    [5, 750],
    [6, 1250],
  ],
  pm10: [
    [1, 20],
    [2, 40],
    [3, 50],
    [4, 100],
    [5, 150],
    [6, 1200],
  ],
  pm2_5: [
    [1, 10],
    [2, 20],
    [3, 25],
    [4, 50],
    [5, 75],
    [6, 800],
  ],
}

export function getPollutantIndexLevel(
  value: number,
  pollutant_type: string,
): number {
  const ranges = aqiRangesByPollutant[pollutant_type]
  for (let i = 0; i < ranges.length; i++) {
    if (value <= ranges[i][1]) {
      return ranges[i][0]
    }
  }
  return ranges.length
}
