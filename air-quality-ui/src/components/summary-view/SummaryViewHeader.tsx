import Switch from '@mui/material/Switch'
import { ChangeEvent, useId } from 'react'

import classes from './SummaryViewHeader.module.css'
import { useForecastContext } from '../../context'

export interface SummaryViewHeaderProps {
  showAllColoured: boolean
  setShowAllColoured: (showAllColoured: boolean) => void
  setEnableHover: (val: boolean) => void
  enableHover: boolean
}

export const SummaryViewHeader = ({
  showAllColoured,
  setShowAllColoured,
  setEnableHover,
  enableHover,
}: SummaryViewHeaderProps): JSX.Element => {
  const { forecastDetails } = useForecastContext()
  const aqiSwitchId = useId()
  const hoverSwitchId = useId()

  return (
    <div className={classes['table-header']}>
      <div className={classes['table-date']}>
        Time Range: {forecastDetails.forecastBaseDate.toFormat('dd MMM HH:mm')}
        {' - '}
        {forecastDetails.maxMeasurementDate.toFormat('dd MMM HH:mm ZZZZ')}
      </div>
      <div className={classes['switches-container']}>
        <div className={`ag-theme-quartz ${classes['table-switch-container']}`}>
          <label
            htmlFor={hoverSwitchId}
            className={`ag-theme-quartz ${classes['table-switch-label']}`}
          >
            Update charts on hover
          </label>
          <Switch
            id={hoverSwitchId}
            className={classes['table-switch']}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setEnableHover(event.target.checked)
            }}
            checked={enableHover}
          />
        </div>
        <div className={`ag-theme-quartz ${classes['table-switch-container']}`}>
          <label
            htmlFor={aqiSwitchId}
            className={`ag-theme-quartz ${classes['table-switch-label']}`}
          >
            Highlight all AQI values
          </label>
          <Switch
            id={aqiSwitchId}
            className={classes['table-switch']}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setShowAllColoured(event.target.checked)
            }}
            checked={showAllColoured}
          />
        </div>
      </div>
    </div>
  )
}
