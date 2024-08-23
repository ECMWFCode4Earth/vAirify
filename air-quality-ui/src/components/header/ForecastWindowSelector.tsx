import Select, { StylesConfig } from 'react-select'

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

const selectStyling: StylesConfig = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    background: 'black',
    height: '100%',
    borderColor: state.isFocused ? 'white' : '#3b3b3b',
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
  input: (baseStyles) => ({
    ...baseStyles,
    color: 'white',
  }),
  dropdownIndicator: (baseStyles) => ({
    ...baseStyles,
    cursor: 'pointer',
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    cursor: 'pointer',
    color: state.isSelected ? '#2f2f2f' : 'white',
    backgroundColor: state.isSelected
      ? state.isFocused
        ? '#62a5f4'
        : '#9ecaf8'
      : state.isFocused
        ? '#373b3e'
        : baseStyles.backgroundColor,
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: '#2f2f2f',
  }),
}

export const ForecastWindowSelector = (props: ForecastWindowSelectorProps) => {
  return (
    <div>
      <label className={classes['forecast-window-label']}>Forecast Days</label>
      <Select
        className={classes['forecast-window-select']}
        inputId="forecast-window-select"
        name="forecast-window-select"
        data-testid="forecast-window-select"
        onChange={(value) => {
          if (value) {
            props.setSelectedForecastWindowState(value as ForecastWindowOption)
          }
        }}
        options={forecastWindowOptions}
        value={props.selectedForecastWindow}
        styles={selectStyling}
      />
    </div>
  )
}

export default ForecastWindowSelector
