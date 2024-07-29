import Button from '@mui/material/Button'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTime } from 'luxon'
import { useState } from 'react'

import classes from './ForecastBaseDatePicker.module.css'
import { useForecastContext } from '../../context'

export const ForecastBaseDatePicker = (): JSX.Element => {
  const { forecastBaseDate, setForecastBaseDate } = useForecastContext()
  const [selectedForecastBaseDate, setSelectedForecastBaseDate] =
    useState<DateTime<boolean>>()
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

  return (
    <div className={classes['forecast-base-date-picker-main-div']}>
      <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-gb">
        <ThemeProvider theme={darkTheme}>
          <DateTimePicker
            sx={{ '.MuiFormLabel-root': { color: 'white' } }}
            label="Forecast Base Date"
            disableFuture={true}
            skipDisabled={true}
            timeSteps={{ minutes: 720 }}
            value={forecastBaseDate}
            onChange={(newValue) => {
              const valueToSet = newValue == null ? DateTime.utc() : newValue
              setSelectedForecastBaseDate(valueToSet)
            }}
          />
        </ThemeProvider>
      </LocalizationProvider>
      <div className={classes['forecast-base-date-picker-button-div']}>
        <Button
          variant="outlined"
          onClick={() => {
            if (selectedForecastBaseDate != undefined) {
              setForecastBaseDate(selectedForecastBaseDate)
            }
          }}
        >
          Ok
        </Button>
      </div>
    </div>
  )
}
