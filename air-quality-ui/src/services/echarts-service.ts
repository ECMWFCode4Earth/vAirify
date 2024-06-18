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
