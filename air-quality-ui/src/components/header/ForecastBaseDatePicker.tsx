import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTime } from 'luxon'

interface Props {
  setSelectedForecastBaseDate: (valueToSet: DateTime<boolean>) => void
  setIsInvalidDateTime: (value: boolean) => void
  forecastBaseDate: DateTime<boolean>
}
export const ForecastBaseDatePicker = (props: Props): JSX.Element => {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

  const isTimeInvalid = (value: DateTime) => {
    return value > DateTime.utc() || value.minute != 0 || value.hour % 12 != 0
  }

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-gb">
      <ThemeProvider theme={darkTheme}>
        <DateTimePicker
          sx={{ '.MuiFormLabel-root': { color: 'white' } }}
          label="Forecast Base Date"
          disableFuture={true}
          skipDisabled={true}
          timeSteps={{ minutes: 720 }}
          value={props.forecastBaseDate}
          shouldDisableTime={isTimeInvalid}
          onChange={(newValue) => {
            if (newValue) {
              props.setIsInvalidDateTime(isTimeInvalid(newValue))
              props.setSelectedForecastBaseDate(newValue)
            }
          }}
        />
      </ThemeProvider>
    </LocalizationProvider>
  )
}
