import {
  AccessTime,
  Add,
  GridOn,
  LocationOn,
  Pause,
  PlayArrow,
  Public,
  Remove,
  Fullscreen,
  FullscreenExit,
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
  isFullscreen?: boolean
  onFullscreenToggle: () => void
  selectedVariable?: string
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
  isFullscreen = false,
  onFullscreenToggle,
  selectedVariable: externalSelectedVariable,
}) => {
  const [sliderValue, setSliderValue] = useState(0.0)
  const [globeAnimationState, setGlobeAnimationState] = useState(false)
  const [locationMarkerState, setLocationMarkerState] = useState(true)
  const [filterState, setGridFilterState] = useState(false)
  const [timeInterpolationState, setTimeInterpolationState] = useState(true)
  const [timeDelta, setTimeDelta] = useState(0.06)
  const [selectedVariable, setSelectedVariable] = useState(externalSelectedVariable || 'aqi')

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
      forceUpdate()
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

  useEffect(() => {
    if (externalSelectedVariable && selectedVariable !== externalSelectedVariable) {
      setSelectedVariable(externalSelectedVariable)
    }
  }, [externalSelectedVariable])

  const handleIncreaseTimeDelta = () => {
    setTimeDelta((prevDelta) => prevDelta + 0.02)
  }

  const handleDecreaseTimeDelta = () => {
    setTimeDelta((prevDelta) => Math.max(0.02, prevDelta - 0.02))
  }

  return (
    <div style={{
      ...styles.controlsContainer,
      width: isFullscreen ? '600px' : '350px',
      margin: isFullscreen ? '10px 8px 40px 8px' : '8px',
    }}>
      <Button
        onClick={onToggleTimeUpdate}
        style={{
          ...styles.controlButton,
          backgroundColor: isTimeRunning ? '#1976d2' : 'lightgray',
        }}
      >
        {isTimeRunning ? (
          <Pause
            fontSize="small"
            style={isTimeRunning ? styles.activeIcon : undefined}
          />
        ) : (
          <PlayArrow fontSize="small" />
        )}
      </Button>

      {isFullscreen && (
        <>
          <Button onClick={handleDecreaseTimeDelta} style={styles.controlButton}>
            <Remove fontSize="small" />
          </Button>

          <Button onClick={handleIncreaseTimeDelta} style={styles.controlButton}>
            <Add fontSize="small" />
          </Button>
        </>
      )}

      <div style={styles.sliderContainer}>
        <label 
          htmlFor="slider" 
          style={{
            fontSize: isFullscreen ? '14px' : '12px',
            whiteSpace: 'nowrap',
          }}
        >
          {currentDate}
        </label>
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

      {isFullscreen && (
        <>
          <Button
            onClick={handleLocationMarkerClick}
            style={{
              ...styles.controlButton,
              backgroundColor: locationMarkerState ? '#1976d2' : 'lightgray',
            }}
          >
            <LocationOn
              fontSize="small"
              style={locationMarkerState ? styles.activeIcon : undefined}
            />
          </Button>

          <Button
            onClick={handleGlobeButtonClick}
            style={{
              ...styles.controlButton,
              backgroundColor: globeAnimationState ? '#1976d2' : 'lightgray',
            }}
          >
            <Public
              fontSize="small"
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
              fontSize="small"
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
              fontSize="small"
              style={timeInterpolationState ? styles.activeIcon : undefined}
            />
          </Button>
        </>
      )}

      <Select
        value={selectedVariable}
        onChange={handleVariableSelectChange}
        style={{
          ...styles.dropdown,
          fontSize: isFullscreen ? '14px' : '12px',
          height: isFullscreen ? '32px' : '28px',
        }}
      >
        <MenuItem value="aqi" style={{ fontSize: isFullscreen ? '14px' : '12px' }}>AQI</MenuItem>
        <MenuItem value="pm2_5" style={{ fontSize: isFullscreen ? '14px' : '12px' }}>PM2.5</MenuItem>
        <MenuItem value="pm10" style={{ fontSize: isFullscreen ? '14px' : '12px' }}>PM10</MenuItem>
        <MenuItem value="no2" style={{ fontSize: isFullscreen ? '14px' : '12px' }}>NO2</MenuItem>
        <MenuItem value="o3" style={{ fontSize: isFullscreen ? '14px' : '12px' }}>O3</MenuItem>
        <MenuItem value="so2" style={{ fontSize: isFullscreen ? '14px' : '12px' }}>SO2</MenuItem>
      </Select>

      <Button onClick={onFullscreenToggle} style={styles.controlButton}>
        {isFullscreen ? (
          <FullscreenExit fontSize="small" />
        ) : (
          <Fullscreen fontSize="small" />
        )}
      </Button>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  controlsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f4f4f4',
    borderTop: '1px solid #ccc',
    maxWidth: '100%',
    padding: '4px',
  },
  controlButton: {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '2px',
    padding: '4px',
  },
  sliderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  slider: {
    width: '140px',
  },
  dropdown: {
    width: '80px',
    height: '32px',
    borderRadius: '4px',
    border: '1px solid lightgray',
    padding: '4px',
    margin: '2px',
    cursor: 'pointer',
  },
  activeIcon: {
    color: 'white',
    fontWeight: 'bold',
  },
  globeButton: {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '2px',
    padding: '4px',
  },
  checkerboardButton: {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '2px',
    padding: '4px',
  }
}

export default Controls
