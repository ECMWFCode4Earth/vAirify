import Switch from '@mui/material/Switch'
import { ChangeEvent, useId } from 'react'

import classes from './SummaryViewHeader.module.css'
import { useForecastContext } from '../../context'

export interface SummaryViewHeaderProps {
  showAllColoured: boolean
  setShowAllColoured: (showAllColoured: boolean) => void
}

export const SummaryViewHeader = ({
  showAllColoured,
  setShowAllColoured,
}: SummaryViewHeaderProps): JSX.Element => {
  const { forecastDetails } = useForecastContext()
  const switchId = useId()

  return (
    <div className={classes['table-header']}>
      <div className={classes['table-date']}>
        Time Range: {forecastDetails.forecastBaseDate.toFormat('dd MMM HH:mm')}
        {' - '}
        {forecastDetails.maxMeasurementDate.toFormat('dd MMM HH:mm ZZZZ')}
      </div>
      <div className={`ag-theme-quartz ${classes['table-switch-container']}`}>
        <label
          htmlFor={switchId}
          className={`ag-theme-quartz ${classes['table-switch-label']}`}
        >
          Highlight all AQI values
        </label>
        <Switch
          id={switchId}
          className={classes['table-switch']}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setShowAllColoured(event.target.checked)
          }}
          checked={showAllColoured}
        />
      </div>
    </div>
  )
}
