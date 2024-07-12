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

export const getNearestValidForecastTime = (time: DateTime): DateTime => {
  const utc = time.toUTC()
  const { hour: utcHour } = utc
  const validForecastHour =
    utcHour === 0 || utcHour % 3 === 0 ? utcHour : utcHour - (utcHour % 3)
  return DateTime.utc(utc.year, utc.month, utc.day, validForecastHour, 0, 0)
}

export const getValidForecastTimesBetween = (
  start: DateTime,
  end = DateTime.utc(),
): DateTime[] => {
  const nearestValidForecastTime = getNearestValidForecastTime(start)
  const validTimes = []
  let incrementHours = 0
  while (nearestValidForecastTime.plus({ hours: incrementHours }) <= end) {
    validTimes.push(nearestValidForecastTime.plus({ hours: incrementHours }))
    incrementHours += 3
  }
  return validTimes
}

export const getInSituPercentage = (
  baseForecastDate: DateTime,
  maxForecastDate: DateTime,
  maxInSituDate: DateTime,
): number => {
  if (maxForecastDate.equals(maxInSituDate)) {
    return 100
  }

  return (
    100 *
    (maxInSituDate.diff(baseForecastDate).milliseconds /
      maxForecastDate.diff(baseForecastDate).milliseconds)
  )
}
