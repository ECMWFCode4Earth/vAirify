import Select from 'react-select'

import classes from './ForecastWindowSelector.module.css'

export type ForecastWindowOption = {
  value: number
  label: string
}

const forecastWindowOptions: ForecastWindowOption[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
]

export interface ForecastWindowSelectorProps {
  setSelectedForecastWindowState: (value: ForecastWindowOption) => void
  selectedForecastWindow: ForecastWindowOption
}

export const ForecastWindowSelector = (props: ForecastWindowSelectorProps) => {
  return (
    <div>
      <label className={classes['forecast-window-label']}>
        Forecast Window
      </label>
      <Select
        className={classes['forecast-window-select']}
        inputId="forecast-window-select"
        name="forecast-window-select"
        data-testid="forecast-window-select"
        onChange={(value) => {
          if (value) {
            props.setSelectedForecastWindowState(value)
          }
        }}
        options={forecastWindowOptions}
        value={props.selectedForecastWindow}
      />
    </div>
  )
}

export default ForecastWindowSelector
