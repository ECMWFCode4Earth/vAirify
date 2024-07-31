import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTime } from 'luxon'

interface Props {
  setSelectedForecastBaseDate: (valueToSet: DateTime<boolean>) => void
  isTimeInvalid: (value: DateTime) => boolean
  forecastBaseDate: DateTime<boolean>
}
export const ForecastBaseDatePicker = (props: Props): JSX.Element => {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

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
          shouldDisableTime={props.isTimeInvalid}
          onChange={(newValue) => {
            const valueToSet = newValue == null ? DateTime.utc() : newValue
            props.setSelectedForecastBaseDate(valueToSet)
          }}
        />
      </ThemeProvider>
    </LocalizationProvider>
  )
}
