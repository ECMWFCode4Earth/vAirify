import { DateTime, Duration } from 'luxon'

export const getLatestBaseForecastTime = (
  from: DateTime = DateTime.utc(),
): Date => {
  const hour = from.hour
  let modelHour = 12
  if (hour >= 10 && hour < 22) {
    modelHour = 0
  }
  let modelDate = DateTime.utc(from.year, from.month, from.day, modelHour, 0, 0)
  if (hour >= 0 && hour < 10) {
    modelDate = modelDate.minus(Duration.fromObject({ days: 1 }))
  }
  return modelDate.toJSDate()
}

export const formatDate = (date: Date, setHours?: string): string => {
  return (
    date.getUTCFullYear().toString() +
    '-' +
    ('0' + (date.getUTCMonth() + 1).toString()).slice(-2) +
    '-' +
    ('0' + date.getUTCDate().toString()).slice(-2) +
    'T' +
    (setHours !== undefined ? setHours : ('0' + date.getUTCHours()).slice(-2)) +
    ':' +
    '00' +
    ':' +
    '00.000' +
    '+00:00'
  )
}
