import { DateTime } from 'luxon'

export function xAxisFormat(timestamp: string, index: number) {
  const date = DateTime.fromISO(timestamp, {
    zone: 'utc',
  })
  if (index === 0 || date.hour === 0) {
    return `${date.toFormat('yyyy-MM-dd HH:mm')}`
  }
  return `${date.toFormat('HH:mm')}`
}

export function toolTipFormat(params: { value: [string, number] }) {
  return `x: ${DateTime.fromISO(params.value[0], { zone: 'utc' }).toFormat('yyyy-MM-dd HH:mm')}, y: ${params.value[1]}`
}
