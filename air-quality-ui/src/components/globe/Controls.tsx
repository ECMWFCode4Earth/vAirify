import React, { useState, useEffect } from 'react';
import { useForecastContext } from '../../context';

type ControlsProps = {
  isTimeRunning: boolean;
  onToggleTimeUpdate: () => void;
  onSliderChange: (value: number) => void;
  onGlobeButtonClick: (globeAnimationState: boolean) => void;
  onLocationMarkerClick: (locationMarkerState: boolean) => void;
  onGridFilterClick: (filterState: boolean) => void;
  onTimeInterpolationClick: (filterState: boolean) => void;
  onVariableSelect: (variable: string) => void; // New prop for variable selection
};

const Controls: React.FC<ControlsProps> = ({
  isTimeRunning,
  onToggleTimeUpdate,
  onSliderChange,
  onGlobeButtonClick,
  onLocationMarkerClick,
  onGridFilterClick,
  onTimeInterpolationClick,
  onVariableSelect, // New prop passed from parent
}) => {
  const [sliderValue, setSliderValue] = useState(0.0); // Default slider value
  const [globeAnimationState, setGlobeAnimationState] = useState(false); // State for globe animation
  const [locationMarkerState, setLocationMarkerState] = useState(true); // State for location marker
  const [filterState, setGridFilterState] = useState(false); // State for grid filter
  const [timeInterpolationState, setTimeInterpolationState] = useState(true); // State for time interpolation
  const [timeDelta, setTimeDelta] = useState(0.06); // State for the speed of the slider's advancement
  const [selectedVariable, setSelectedVariable] = useState('aqi'); // Default variable to display

  // Handle slider change from user input
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value); // Parse as float for decimal values
    setSliderValue(value);
  };

  const { forecastDetails } = useForecastContext();
  const numForecastHours = forecastDetails.maxForecastDate.diff(forecastDetails.forecastBaseDate, 'hours').hours;
  const numForecastTimeSteps = numForecastHours / 3;
  
  const currentDate = forecastDetails.forecastBaseDate.plus({ hours: Math.floor(sliderValue * 3) }).toFormat('yyyy-MM-dd T')+' UTC'; 

  // Effect to notify parent of slider changes
  useEffect(() => {
    onSliderChange(sliderValue);
  }, [sliderValue, onSliderChange]);

  // Automatically advance the slider when isTimeRunning is true
  useEffect(() => {
    if (isTimeRunning) {
      const interval = setInterval(() => {
        setSliderValue((prevValue) => (prevValue >= numForecastTimeSteps ? 0 : prevValue + timeDelta));
      }, 25);

      return () => clearInterval(interval); // Clean up the interval
    }
  }, [isTimeRunning, timeDelta]);

  // Handle globe button click
  const handleGlobeButtonClick = () => {
    setGlobeAnimationState((prevState) => !prevState); // Toggle globe animation state
    onGlobeButtonClick(!globeAnimationState); // Notify parent of the state change
  };

  // Handle location marker button click
  const handleLocationMarkerClick = () => {
    setLocationMarkerState((prevState) => !prevState); // Toggle location marker state
    onLocationMarkerClick(!locationMarkerState); // Notify parent of the state change
  };

  // Handle grid filter button click
  const handleGridFilterClick = () => {
    setGridFilterState((prevState) => !prevState);
    onGridFilterClick(!filterState); // Notify parent of the state change
  };

  const handleTimeInterpolationClick = () => {
    setTimeInterpolationState((prevState) => !prevState);
    onTimeInterpolationClick(!timeInterpolationState); // Notify parent of the state change
  };

  // Handle variable selection change
  const handleVariableSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const variable = event.target.value;
    setSelectedVariable(variable);
    onVariableSelect(variable); // Notify parent of the variable change
  };

  // Increase timeDelta
  const handleIncreaseTimeDelta = () => {
    setTimeDelta((prevDelta) => prevDelta + 0.02); // Increase by 0.01
  };

  // Decrease timeDelta
  const handleDecreaseTimeDelta = () => {
    setTimeDelta((prevDelta) => Math.max(0.02, prevDelta - 0.02)); // Decrease by 0.01, but don't go below 0.01
  };

  return (
    <div style={styles.controlsContainer}>
      {/* Button to toggle time update */}
      <button
        onClick={onToggleTimeUpdate}
        style={styles.controlButton}
      >
        <span style={styles.icon}>{isTimeRunning ? '⏸️' : '▶️'}</span>
      </button>

      {/* Minus Button */}
      <button
        onClick={handleDecreaseTimeDelta}
        style={styles.controlButton}
      >
        <span style={styles.icon}>➖</span>
      </button>

      {/* Plus Button */}
      <button
        onClick={handleIncreaseTimeDelta}
        style={styles.controlButton}
      >
        <span style={styles.icon}>➕</span>
      </button>

      {/* Slider */}
      <div style={styles.sliderContainer}>
        <label htmlFor="slider">{currentDate}</label>
        <input
          id="slider"
          type="range"
          min="0"
          max={numForecastTimeSteps.toString()}
          step="0.1"
          value={sliderValue}
          onChange={handleSliderChange}
          style={styles.slider}
        />
      </div>

      {/* Location Marker Button */}
      <button
        className="location-icon"
        onClick={handleLocationMarkerClick}
        style={styles.controlButton}
      >
        <span style={styles.icon}>📍</span>
      </button>

      {/* Globe Button */}
      <button
        className="globe-icon"
        onClick={handleGlobeButtonClick}
        style={styles.globeButton}
      >
        <span style={styles.icon}>🌍</span>
      </button>

      {/* Checkerboard Button */}
      <button
        className="checkerboard-icon"
        onClick={handleGridFilterClick}
        style={styles.checkerboardButton}
      >
      </button>

      {/* Step Curve Button */}
      <button
        className="step-curve-icon"
        onClick={handleTimeInterpolationClick}
        style={styles.controlButton}
      >
        <span style={styles.icon}>🕒</span>
      </button>

        {/* Variable Selection Dropdown */}
            <select value={selectedVariable} onChange={handleVariableSelectChange} style={styles.dropdown}>
        <option value="aqi">AQI</option>
        <option value="pm10">PM10</option>
      </select>
    </div>
  );
};

const styles = {
  controlsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#f4f4f4',
    borderTop: '1px solid #ccc',
  },
  controlButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '32px',
    backgroundColor: 'lightgray',
    border: 'none',
    borderRadius: '20%',
    cursor: 'pointer',
  },
  sliderContainer: {
    display: 'flex',
    flexDirection: 'column',
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
    cursor: 'pointer',
  },
  icon: {
    fontSize: '28px',
    lineHeight: '32px',
  },
  checkerboardButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '32px',
    backgroundColor: 'gray',
    border: 'none',
    borderRadius: '20%',
    cursor: 'pointer',
    backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                      linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #ccc 75%), 
                      linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  },
  stepIcon: {
    fontSize: '28px',
    lineHeight: '32px',
  },
};

export default Controls;