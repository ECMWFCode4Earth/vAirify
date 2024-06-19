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
 * Creates a colorCode for an input string. The colour will always be the same for the string
 * @param text
 * @returns
 */
export const textToColor = async (text: string): Promise<string> => {
  // Create a SHA-256 hash of the input text
  const generateHash = async (text: string): Promise<ArrayBuffer> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return hash
  }

  // Convert the hash to a hexadecimal string
  const hashToHex = (hash: ArrayBuffer): string => {
    let hex = ''
    const hashArray = Array.from(new Uint8Array(hash))
    hashArray.forEach((byte) => {
      hex += byte.toString(16).padStart(2, '0')
    })
    return hex
  }

  // Main function to generate the color
  return generateHash(text).then((hash) => {
    const hex = hashToHex(hash)
    // Use the first 6 characters of the hash to form the color code
    const colorCode = `#${hex.slice(0, 6)}`
    return colorCode
  })
}
