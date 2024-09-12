import Switch from '@mui/material/Switch'

import classes from './MapViewHeader.module.css'

export interface MapViewHeaderProps {
  showMap: boolean
  setShowMap: (showMap: boolean) => void
}

export const MapViewHeader = ({
  showMap,
  setShowMap,
}: MapViewHeaderProps): JSX.Element => {

  return (
    <div className={classes['table-header']}>
      <div className={`ag-theme-quartz ${classes['table-switch-container']}`}>
        <label className={`ag-theme-quartz ${classes['table-switch-label']}`}>
          Show map view (experimental)
        </label>
        <Switch
          className={classes['table-switch']}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setShowMap(event.target.checked)
          }}
          checked={showMap}
        />
      </div>
    </div>
  )
}
