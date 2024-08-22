import { DateTime } from 'luxon'
import { useState } from 'react'

import { Breadcrumbs } from './Breadcrumbs'
import { ForecastBaseDatePicker } from './ForecastBaseDatePicker'
import {
  ForecastWindowOption,
  ForecastWindowSelector,
} from './ForecastWindowSelector'
import classes from './Toolbar.module.css'
import { useForecastContext } from '../../context'
import { VAirifyButton } from '../common/button/VAirifyButton'

export const Toolbar = () => {
  const { forecastDetails, setDetails } = useForecastContext()

  const [selectedForecastBaseDate, setSelectedForecastBaseDate] = useState<
    DateTime<boolean>
  >(forecastDetails.forecastBaseDate)
  const [selectedForecastWindow, setSelectedForecastWindow] =
    useState<ForecastWindowOption>({ value: 1, label: '1' })
  const [isInvalidDateTime, setIsInvalidDateTime] = useState<boolean>(false)

  return (
    <section
      role="toolbar"
      aria-label="Toolbar with site navigation, search and date selection"
      className={classes['toolbar-section']}
    >
      <div>
        <Breadcrumbs />
      </div>
      <div className={classes['controls']}>
        <div className={classes['forecast-base-date-picker-div']}>
          <ForecastBaseDatePicker
            setSelectedForecastBaseDate={setSelectedForecastBaseDate}
            setIsInvalidDateTime={setIsInvalidDateTime}
            forecastBaseDate={forecastDetails.forecastBaseDate}
          />
        </div>
        <div className={classes['forecast-window-main-div']}>
          <ForecastWindowSelector
            setSelectedForecastWindowState={setSelectedForecastWindow}
            selectedForecastWindow={selectedForecastWindow}
          />
        </div>
        <div className={classes['forecast-base-date-picker-button-div']}>
          <VAirifyButton
            onClick={() => {
              if (selectedForecastBaseDate) {
                setDetails({
                  forecastBaseDate: selectedForecastBaseDate,
                  forecastWindow: selectedForecastWindow.value,
                })
              }
            }}
            text={'Ok'}
            isButtonDisabled={isInvalidDateTime}
          />
        </div>
      </div>
    </section>
  )
}
