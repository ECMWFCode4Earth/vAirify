import Switch from 'react-switch'

import classes from './SummaryViewHeader.module.css'
import { useForecastContext } from '../../context'

interface SummaryViewHeaderProps {
  showAllColoured: boolean
  setShowAllColoured: (showAllColoured: boolean) => void
}

export const SummaryViewHeader = ({
  showAllColoured,
  setShowAllColoured,
}: SummaryViewHeaderProps): JSX.Element => {
  const { forecastBaseDate, maxInSituDate } = useForecastContext()

  return (
    <div className={classes['table-header']}>
      <div className={classes['table-date']}>
        Time Range: {forecastBaseDate.toFormat('dd MMM HH:mm')}
        {' - '}
        {maxInSituDate.toFormat('dd MMM HH:mm ZZZZ')}
      </div>
      <div className={`ag-theme-quartz ${classes['table-switch-container']}`}>
        <label className={`ag-theme-quartz ${classes['table-switch-label']}`}>
          {showAllColoured
            ? 'Highlight all AQI values'
            : 'Highlight primary AQI values'}
        </label>
        <Switch
          className={classes['table-switch']}
          data-testid="aqi-highlight-switch"
          onChange={() => {
            if (showAllColoured) setShowAllColoured(false)
            else setShowAllColoured(true)
          }}
          checked={showAllColoured}
        />
      </div>
    </div>
  )
}
