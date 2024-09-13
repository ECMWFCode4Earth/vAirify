import {
  AccessTime,
  Add,
  GridOn,
  LocationOn,
  Pause,
  PlayArrow,
  Public,
  Remove,
} from '@mui/icons-material'
import { Button, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import React, {
  CSSProperties,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'

import { useForecastContext } from '../../context'
import { ForecastResponseDto } from '../../services/types'

type ControlsProps = {
  isTimeRunning: boolean
  onToggleTimeUpdate: () => void
  onSliderChange: (value: number) => void
  onGlobeButtonClick: (globeAnimationState: boolean) => void
  onLocationMarkerClick: (locationMarkerState: boolean) => void
  onGridFilterClick: (filterState: boolean) => void
  onTimeInterpolationClick: (filterState: boolean) => void
  onVariableSelect: (variable: string) => void
  forecastData: Record<string, ForecastResponseDto[]>
}

const Controls: React.FC<ControlsProps> = ({
  isTimeRunning,
  onToggleTimeUpdate,
  onSliderChange,
  onGlobeButtonClick,
  onLocationMarkerClick,
  onGridFilterClick,
  onTimeInterpolationClick,
  onVariableSelect,
  forecastData,
}) => {
  const [sliderValue, setSliderValue] = useState(0.0)
  const [globeAnimationState, setGlobeAnimationState] = useState(false)
  const [locationMarkerState, setLocationMarkerState] = useState(true)
  const [filterState, setGridFilterState] = useState(false)
  const [timeInterpolationState, setTimeInterpolationState] = useState(true)
  const [timeDelta, setTimeDelta] = useState(0.06)
  const [selectedVariable, setSelectedVariable] = useState('aqi')

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value)
    setSliderValue(value)
  }

  const { forecastDetails } = useForecastContext()
  const numForecastTimeStepsRef = useRef<number>(0)
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const numForecastHours = forecastDetails.maxForecastDate.diff(
      forecastDetails.forecastBaseDate,
      'hours',
    ).hours
    const newNumForecastTimeSteps = numForecastHours / 3

    if (numForecastTimeStepsRef.current !== newNumForecastTimeSteps) {
      numForecastTimeStepsRef.current = newNumForecastTimeSteps
      forceUpdate() // This will trigger a re-render
    }
  }, [forecastDetails.maxForecastDate, forecastDetails.forecastBaseDate])

  const currentDate =
    forecastDetails.forecastBaseDate
      .plus({ hours: Math.floor(sliderValue * 3) })
      .toFormat('yyyy-MM-dd T') + ' UTC'

  useEffect(() => {
    setSliderValue(0)
  }, [forecastData])

  useEffect(() => {
    onSliderChange(sliderValue)
  }, [sliderValue, onSliderChange])

  useEffect(() => {
    if (isTimeRunning) {
      const interval = setInterval(() => {
        setSliderValue((prevValue) =>
          prevValue >= numForecastTimeStepsRef.current
            ? 0
            : prevValue + timeDelta,
        )
      }, 25)

      return () => clearInterval(interval)
    }
  }, [isTimeRunning, timeDelta])

  const handleGlobeButtonClick = () => {
    setGlobeAnimationState((prevState) => !prevState)
    onGlobeButtonClick(!globeAnimationState)
  }

  const handleLocationMarkerClick = () => {
    setLocationMarkerState((prevState) => !prevState)
    onLocationMarkerClick(!locationMarkerState)
  }

  const handleGridFilterClick = () => {
    setGridFilterState((prevState) => !prevState)
    onGridFilterClick(!filterState)
  }

  const handleTimeInterpolationClick = () => {
    setTimeInterpolationState((prevState) => !prevState)
    onTimeInterpolationClick(!timeInterpolationState)
  }

  const handleVariableSelectChange = (event: SelectChangeEvent<string>) => {
    const variable = event.target.value
    setSelectedVariable(variable)
    onVariableSelect(variable)
  }

  const handleIncreaseTimeDelta = () => {
    setTimeDelta((prevDelta) => prevDelta + 0.02)
  }

  const handleDecreaseTimeDelta = () => {
    setTimeDelta((prevDelta) => Math.max(0.02, prevDelta - 0.02))
  }

  return (
    <div style={styles.controlsContainer}>
      <Button
        onClick={onToggleTimeUpdate}
        style={{
          ...styles.controlButton,
          backgroundColor: isTimeRunning ? '#1976d2' : 'lightgray',
        }}
      >
        {isTimeRunning ? (
          <Pause
            fontSize="large"
            style={isTimeRunning ? styles.activeIcon : undefined}
          />
        ) : (
          <PlayArrow fontSize="large" />
        )}
      </Button>

      <Button onClick={handleDecreaseTimeDelta} style={styles.controlButton}>
        <Remove fontSize="large" />
      </Button>

      <Button onClick={handleIncreaseTimeDelta} style={styles.controlButton}>
        <Add fontSize="large" />
      </Button>

      <div style={styles.sliderContainer}>
        <label htmlFor="slider">{currentDate}</label>
        <input
          id="slider"
          type="range"
          min="0"
          max={numForecastTimeStepsRef.current.toString()}
          step="0.1"
          value={sliderValue}
          onChange={handleSliderChange}
          style={styles.slider}
        />
      </div>

      <Button
        onClick={handleLocationMarkerClick}
        style={{
          ...styles.controlButton,
          backgroundColor: locationMarkerState ? '#1976d2' : 'lightgray',
        }}
      >
        <LocationOn
          fontSize="large"
          style={locationMarkerState ? styles.activeIcon : undefined}
        />
      </Button>

      <Button
        onClick={handleGlobeButtonClick}
        style={{
          ...styles.globeButton,
          backgroundColor: globeAnimationState ? '#1976d2' : 'lightgray',
        }}
      >
        <Public
          fontSize="large"
          style={globeAnimationState ? styles.activeIcon : undefined}
        />
      </Button>

      <Button
        onClick={handleGridFilterClick}
        style={{
          ...styles.checkerboardButton,
          backgroundColor: filterState ? '#1976d2' : 'lightgray',
        }}
      >
        <GridOn
          fontSize="large"
          style={filterState ? styles.activeIcon : undefined}
        />
      </Button>

      <Button
        onClick={handleTimeInterpolationClick}
        style={{
          ...styles.controlButton,
          backgroundColor: timeInterpolationState ? '#1976d2' : 'lightgray',
        }}
      >
        <AccessTime
          fontSize="large"
          style={timeInterpolationState ? styles.activeIcon : undefined}
        />
      </Button>

      <Select
        value={selectedVariable}
        onChange={handleVariableSelectChange}
        style={styles.dropdown}
      >
        <MenuItem value="aqi">AQI</MenuItem>
        <MenuItem value="pm2_5">PM2.5</MenuItem>
        <MenuItem value="pm10">PM10</MenuItem>
        <MenuItem value="o3">O3</MenuItem>
      </Select>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  controlsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px', // Consistent gap between all controls
    padding: '10px',
    backgroundColor: '#f4f4f4',
    borderTop: '1px solid #ccc',
  },
  controlButton: {
    width: '50px', // Make the buttons consistent in size
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    borderRadius: '10%', // Consistent round button shape
    cursor: 'pointer',
    margin: '5px', // Add consistent margin around each button
    padding: '10px', // Add padding for more consistent button sizing
  },
  sliderContainer: {
    display: 'flex',
    flexDirection: 'column', // Make sure this is typed correctly
    alignItems: 'center',
  },
  slider: {
    width: '500px',
  },
  dropdown: {
    width: '100px',
    height: '40px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid lightgray',
    padding: '5px',
    margin: '5px', // Add margin to match the buttons
    cursor: 'pointer',
  },
  activeIcon: {
    color: 'white',
    fontWeight: 'bold',
  },
}

export default Controls
