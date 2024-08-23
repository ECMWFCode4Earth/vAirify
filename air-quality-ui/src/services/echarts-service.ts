import { EChartsType } from 'echarts'
import { DateTime } from 'luxon'

/**
 * This function strips of the timezone of a ISO date string and changes it to a users local timezone.
 *
 * E.g.  2024-06-18T00:00:00Z would become 2024-06-18T00:00:00+01:00 for a user in BST
 *
 * The intended use is for echarts time series data where we always want to show time in UTC
 *
 * @param date
 * @returns
 */
export const convertToLocalTime = (date: string): string | null => {
  const { year, month, day, hour, minute, second } = DateTime.fromISO(date, {
    zone: 'utc',
  })
  // Strip UTC timezone off for echarts
  return DateTime.fromObject(
    {
      year,
      month,
      day,
      hour,
      minute,
      second,
    },
    { zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  ).toISO()
}

/**
 * Retrieves a color for an input numeric index.
 * @param number
 * @returns
 */
export const indexToColor = async (index: number): Promise<string> => {
  const colours = [
    '#FF0000', // Red
    '#0088FF', // Blue
    '#00FF00', // Green
    '#FF8800', // Orange
    '#80530d', // Brown
    '#777777', // Grey
    '#8800FF', // Purple
    '#FFFF00', // Yellow
    '#0000FF', // Navy
    '#FF00FF', // Pink,
  ]
  return colours[index % colours.length]
}

export const xAxisFormat = (timestamp: number, index: number) => {
  const date = DateTime.fromMillis(timestamp)
  if (index === 0 || date.hour === 0) {
    return date.toFormat('dd/MM')
  }
  return date.toFormat('HH:mm')
}

const formatDate = (date: DateTime) => {
  return date.toFormat('dd/MM/yyyy HH:mm')
}

export const formatDateRange = (start: DateTime, end: DateTime) => {
  return `${formatDate(start)} to ${formatDate(end)}`
}

export const createSubtext = (
  forecast: DateTime,
  start: DateTime,
  end: DateTime,
) => {
  return `Forecast: ${formatDate(forecast)} \n Range: ${formatDateRange(start, end)}`
}

export const updateChartSubtext = (
  chart: EChartsType,
  forecastTime: DateTime,
) => {
  const options = chart.getOption()
  const dateRange = {
    start: DateTime.fromMillis(options.dataZoom![0].startValue as number),
    end: DateTime.fromMillis(options.dataZoom![0].endValue as number),
  }

  chart.setOption({
    title: {
      subtext: createSubtext(forecastTime, dateRange.start, dateRange.end),
    },
  })
}
