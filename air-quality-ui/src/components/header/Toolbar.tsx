import { DateTime } from 'luxon'
import { useState } from 'react'

import { Breadcrumbs } from './Breadcrumbs'
import { ForecastBaseDatePicker } from './ForecastBaseDatePicker'
import classes from './Toolbar.module.css'
import { useForecastContext } from '../../context'
import { VAirifyButton } from '../common/button/VAirifyButton'

export const Toolbar = () => {
  const { forecastBaseDate, setForecastBaseDate } = useForecastContext()
  const [selectedForecastBaseDate, setSelectedForecastBaseDate] =
    useState<DateTime<boolean>>(forecastBaseDate)
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
      <div className={classes['forecast-base-date-picker-div']}>
        <ForecastBaseDatePicker
          setSelectedForecastBaseDate={setSelectedForecastBaseDate}
          setIsInvalidDateTime={setIsInvalidDateTime}
          forecastBaseDate={forecastBaseDate}
        />
      </div>
      <div className={classes['forecast-base-date-picker-button-div']}>
        <VAirifyButton
          onClick={() => {
            if (selectedForecastBaseDate) {
              setForecastBaseDate(selectedForecastBaseDate)
            }
          }}
          text={'Ok'}
          isButtonDisabled={isInvalidDateTime}
        />
      </div>
    </section>
  )
}
