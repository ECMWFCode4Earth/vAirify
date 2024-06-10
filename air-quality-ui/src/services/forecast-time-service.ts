import { DateTime, Duration } from 'luxon'

export const getLatestBaseForecastTime = (from = DateTime.utc()): DateTime => {
  const hour = from.hour
  let modelHour = 12
  if (hour >= 10 && hour < 22) {
    modelHour = 0
  }
  let modelDate = DateTime.utc(from.year, from.month, from.day, modelHour, 0, 0)
  if (hour >= 0 && hour < 10) {
    modelDate = modelDate.minus(Duration.fromObject({ days: 1 }))
  }
  return modelDate
}

export const getLatestValidForecastTime = (): DateTime => {
  const from = DateTime.utc()
  const hour = from.hour
  const validHour = hour % 3 === 0 ? hour - 3 : hour - (hour % 3)
  return DateTime.utc(from.year, from.month, from.day, validHour, 0, 0)
}
