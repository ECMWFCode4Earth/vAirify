import { DateTime } from 'luxon'
import React, { useEffect } from 'react'

import { Breadcrumbs } from './Breadcrumbs'
import { ForecastBaseDatePicker } from './ForecastBaseDatePicker'
import classes from './Toolbar.module.css'
import { useForecastContext } from '../../context'
import { VAirifyButton } from '../common/button/VAirifyButton'

export const Toolbar = () => {
  const { forecastBaseDate, setForecastBaseDate } = useForecastContext()
  const [selectedForecastBaseDate, setSelectedForecastBaseDate] =
    React.useState<DateTime<boolean>>(forecastBaseDate)
  const [invalidDateTime, setInvalidDateTime] = React.useState<boolean>(false)

  const isTimeInvalid = (value: DateTime) => {
    return value.minute != 0 || value.hour % 12 != 0
  }

  useEffect(() => {
    if (
      (selectedForecastBaseDate && selectedForecastBaseDate > DateTime.now()) ||
      isTimeInvalid(selectedForecastBaseDate)
    ) {
      setInvalidDateTime(true)
    } else {
      setInvalidDateTime(false)
    }
  }, [selectedForecastBaseDate])

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
          forecastBaseDate={forecastBaseDate}
          isTimeInvalid={isTimeInvalid}
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
          isButtonDisabled={invalidDateTime}
        />
      </div>
    </section>
  )
}
