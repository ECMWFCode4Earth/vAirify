import Switch from '@mui/material/Switch'
import { ChangeEvent, useId, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

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
}: SummaryViewHeaderProps): JSX.Element | null => {
  const { forecastDetails } = useForecastContext()
  const aqiSwitchId = useId()
  const hoverSwitchId = useId()
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalTarget(document.getElementById('toolbar-extra'))
  }, [])

  const content = (
    <>
      <span className={classes['table-date']}>
        Time Range: {forecastDetails.forecastBaseDate.toFormat('dd MMM HH:mm')}
        {' - '}
        {forecastDetails.maxMeasurementDate.toFormat('dd MMM HH:mm ZZZZ')}
      </span>
      <div className={classes['switches-container']}>
        <div className={classes['table-switch-container']}>
          <label
            htmlFor={hoverSwitchId}
            className={classes['table-switch-label']}
          >
            Update charts on hover
          </label>
          <Switch
            id={hoverSwitchId}
            className={classes['table-switch']}
            sx={{ '& .MuiSwitch-track': { backgroundColor: '#666' }, '& .Mui-checked + .MuiSwitch-track': { backgroundColor: '#90caf9' } }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setEnableHover(event.target.checked)
            }}
            checked={enableHover}
          />
        </div>
        <div className={classes['table-switch-container']}>
          <label
            htmlFor={aqiSwitchId}
            className={classes['table-switch-label']}
          >
            Highlight all AQI values
          </label>
          <Switch
            id={aqiSwitchId}
            className={classes['table-switch']}
            sx={{ '& .MuiSwitch-track': { backgroundColor: '#666' }, '& .Mui-checked + .MuiSwitch-track': { backgroundColor: '#90caf9' } }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setShowAllColoured(event.target.checked)
            }}
            checked={showAllColoured}
          />
        </div>
      </div>
    </>
  )

  if (!portalTarget) return null
  return createPortal(content, portalTarget)
}
