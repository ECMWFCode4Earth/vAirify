import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import Select from 'react-select'

import { Breadcrumbs } from './Breadcrumbs'
import { ForecastBaseDatePicker } from './ForecastBaseDatePicker'
import classes from './Toolbar.module.css'
import { useForecastContext } from '../../context'
import { VAirifyButton } from '../common/button/VAirifyButton'

export const Toolbar = () => {
  const {
    forecastBaseDate,
    setForecastBaseDate,
    setMaxForecastDate,
    setMaxInSituDate,
  } = useForecastContext()
  const [selectedForecastBaseDate, setSelectedForecastBaseDate] =
    useState<DateTime<boolean>>(forecastBaseDate)
  const [selectedForecastWindow, setSelectedForecastWindow] =
    useState<ForecastWindowOption>({ value: 1, label: '1' })
  const [isInvalidDateTime, setIsInvalidDateTime] = useState<boolean>(false)

  interface ForecastWindowOption {
    value: number
    label: string
  }

  const forecastWindowOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
  ]
  useEffect(() => {
    setMaxForecastDate(selectedForecastWindow.value)
    setMaxInSituDate(selectedForecastWindow.value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecastBaseDate])
  return (
    <section
      role="toolbar"
      aria-label="Toolbar with site navigation, search and date selection"
      className={classes['toolbar-section']}
    >
      <div>
        <Breadcrumbs />
      </div>
      <div className={classes['forecast-base-date-picker-div']}>
        <ForecastBaseDatePicker
          setSelectedForecastBaseDate={setSelectedForecastBaseDate}
          setIsInvalidDateTime={setIsInvalidDateTime}
          forecastBaseDate={forecastBaseDate}
        />
      </div>
      <div className={classes['forecast-window-main-div']}>
        <label className={classes['forecast-window-label']}>
          Forecast Window
        </label>
        <Select
          className={classes['forecast-window-select']}
          inputId="forecast-window-select"
          name="forecast-window-select"
          onChange={(value) => {
            if (value) {
              setSelectedForecastWindow(value)
            }
          }}
          options={forecastWindowOptions}
          value={selectedForecastWindow}
        />
      </div>
      <div className={classes['forecast-base-date-picker-button-div']}>
        <VAirifyButton
          onClick={() => {
            if (selectedForecastBaseDate) {
              setForecastBaseDate(selectedForecastBaseDate)
            }
            setMaxForecastDate(selectedForecastWindow.value)
            setMaxInSituDate(selectedForecastWindow.value)
          }}
          text={'Ok'}
          isButtonDisabled={isInvalidDateTime}
        />
      </div>
    </section>
  )
}
