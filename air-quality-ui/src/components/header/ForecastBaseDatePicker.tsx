import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTime } from 'luxon'

import { useForecastContext } from '../../context'

export const ForecastBaseDatePicker = (): JSX.Element => {
  const { forecastBaseDate, setForecastBaseDate } = useForecastContext()
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

  const IsTimeInvalid = (value: DateTime) => {
    return value.minute != 0 || (value.hour != 0 && value.hour != 12)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-gb">
      <ThemeProvider theme={darkTheme}>
        <DateTimePicker
          sx={{ '.MuiFormLabel-root': { color: 'white' } }}
          label="Forecast Base Date"
          disableFuture={true}
          shouldDisableTime={IsTimeInvalid}
          skipDisabled={true}
          timeSteps={{ minutes: 720 }}
          value={forecastBaseDate}
          onChange={(newValue) => {
            if (
              newValue != null &&
              newValue < DateTime.utc() &&
              !IsTimeInvalid(newValue)
            ) {
              setForecastBaseDate(newValue)
            }
          }}
        />
      </ThemeProvider>
    </LocalizationProvider>
  )
}
