import Switch from '@mui/material/Switch'
import { ChangeEvent, useId } from 'react'

import classes from './MapViewHeader.module.css'

export interface MapViewHeaderProps {
  showMap: boolean
  setShowMap: (showMap: boolean) => void
}

export const MapViewHeader = ({
  showMap,
  setShowMap,
}: MapViewHeaderProps): JSX.Element => {
  const switchId = useId()

  return (
    <div className={classes['table-header']}>
      <div className={`ag-theme-quartz ${classes['table-switch-container']}`}>
        <label
          htmlFor={switchId}
          className={`ag-theme-quartz ${classes['table-switch-label']}`}
        >
          Show map view (experimental)
        </label>
        <Switch
          id={switchId}
          className={classes['table-switch']}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setShowMap(event.target.checked)
          }}
          checked={showMap}
        />
      </div>
    </div>
  )
}
