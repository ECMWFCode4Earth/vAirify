import { DateTime } from 'luxon'

import classes from './BaseForecastDatetimePicker.module.css'
import { useForecastContext } from '../../context'

export const BaseForecastDatetimePicker = (): JSX.Element => {
  const { forecastBaseDate, setForecastBaseDate } = useForecastContext()
  const datestr = forecastBaseDate.toISODate()?.toString()

  return (
    <div>
      <input
        type="date"
        name="trip-start"
        value={datestr}
        className={classes['date-picker']}
        onChange={(e) =>
          setForecastBaseDate(DateTime.fromISO(e.target.value, { zone: 'UTC' }))
        }
      />
    </div>
  )
}
