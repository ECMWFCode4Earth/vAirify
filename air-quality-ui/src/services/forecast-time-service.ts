import { DateTime, Duration } from 'luxon'

export const getLatestBaseForecastTime = (from = DateTime.utc()): DateTime => {
  const utcDate = from.toUTC()
  const hour = utcDate.hour
  let modelHour = 12
  if (hour >= 10 && hour < 22) {
    modelHour = 0
  }
  let modelDate = DateTime.utc(
    utcDate.year,
    utcDate.month,
    utcDate.day,
    modelHour,
    0,
    0,
  )
  if (hour >= 0 && hour < 10) {
    modelDate = modelDate.minus(Duration.fromObject({ days: 1 }))
  }
  return modelDate
}

export const getLatestValidForecastTime = (from = DateTime.utc()): DateTime => {
  const utcDate = from.toUTC()
  const hour = utcDate.hour
  const hourIsZero = hour === 0
  let validForecastHour
  if (hourIsZero) {
    validForecastHour = 21
  } else {
    validForecastHour = hour % 3 === 0 ? hour - 3 : hour - (hour % 3)
  }
  return DateTime.utc(
    utcDate.year,
    utcDate.month,
    utcDate.day,
    validForecastHour,
    0,
    0,
  ).minus(Duration.fromObject({ days: hourIsZero ? 1 : 0 }))
}
