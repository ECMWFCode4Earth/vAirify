import React, { useState, useEffect } from 'react';
import { useForecastContext } from '../../context';

type ControlsProps = {
  isTimeRunning: boolean;
  onToggleTimeUpdate: () => void;
  onSliderChange: (value: number) => void;
  onGlobeButtonClick: (globeAnimationState: boolean) => void; // New prop to pass globe state to parent
};

const Controls: React.FC<ControlsProps> = ({
  isTimeRunning,
  onToggleTimeUpdate,
  onSliderChange,
  onGlobeButtonClick,
}) => {
  const [sliderValue, setSliderValue] = useState(0.0); // Default slider value
  const [globeAnimationState, setGlobeAnimationState] = useState(false); // State for globe animation

  // Handle slider change from user input
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value); // Parse as float for decimal values
    setSliderValue(value);
  };

  const { forecastDetails } = useForecastContext();
  const numForecastHours = forecastDetails.maxForecastDate.diff(forecastDetails.forecastBaseDate, 'hours').hours;
  const numForecastTimeSteps = numForecastHours / 3;
  
  const currentDate = forecastDetails.forecastBaseDate.plus({ hours: Math.floor(sliderValue * 3) }).toFormat('yyyy-MM-dd T'); 
  
  // Effect to notify parent of slider changes
  useEffect(() => {
    onSliderChange(sliderValue);
  }, [sliderValue, onSliderChange]);

  // Automatically advance the slider when isTimeRunning is true
  useEffect(() => {
    if (isTimeRunning) {
      const interval = setInterval(() => {
        setSliderValue((prevValue) => (prevValue >= numForecastTimeSteps ? 0 : prevValue + 0.05));
      }, 10);

      return () => clearInterval(interval); // Clean up the interval
    }
  }, [isTimeRunning]);

  // Handle globe button click with GSAP animation
  const handleGlobeButtonClick = () => {
    setGlobeAnimationState((prevState) => !prevState); // Toggle globe animation state

    // Notify parent of the state change
    onGlobeButtonClick(!globeAnimationState);
  };

  return (
    <div style={styles.controlsContainer}>
      {/* Button to toggle time update */}
      <button
        onClick={onToggleTimeUpdate}
        style={{
          ...styles.controlButton,
          backgroundColor: isTimeRunning ? 'red' : 'green',
        }}
      >
        {isTimeRunning ? 'Pause Time' : 'Resume Time'}
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

      {/* New Globe Button */}
      <button
        className="globe-icon"
        onClick={handleGlobeButtonClick}
        style={styles.globeButton}
      >
        🌍
      </button>
    </div>
  );
};

const styles = {
  controlsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    padding: '10px',
    backgroundColor: '#f4f4f4',
    borderTop: '1px solid #ccc',
  },
  controlButton: {
    padding: '10px 20px',
    fontSize: '16px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
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
  globeButton: {
    fontSize: '24px',
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Controls;