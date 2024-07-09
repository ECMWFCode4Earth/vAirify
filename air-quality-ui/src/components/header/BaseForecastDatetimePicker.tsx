import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTime } from 'luxon'

import classes from './BaseForecastDatetimePicker.module.css'
import { useForecastContext } from '../../context'

export const BaseForecastDatetimePicker = (): JSX.Element => {
  const { forecastBaseDate, setForecastBaseDate } = useForecastContext()

  return (
    <div className={classes['date-picker']}>
      <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-gb">
        <DateTimePicker
          label="Base Forecast Date"
          disableFuture={true}
          skipDisabled={true}
          timeSteps={{ minutes: 720 }}
          value={forecastBaseDate}
          onChange={(newValue) => {
            const valueToSet = newValue == null ? DateTime.utc() : newValue
            setForecastBaseDate(valueToSet)
          }}
        />
      </LocalizationProvider>
    </div>
  )
}
