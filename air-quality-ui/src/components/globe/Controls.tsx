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
  const [timeDelta, setTimeDelta] = useState(0.03); // State for the speed of the slider's advancement

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
        setSliderValue((prevValue) => (prevValue >= numForecastTimeSteps ? 0 : prevValue + timeDelta));
      }, 10);

      return () => clearInterval(interval); // Clean up the interval
    }
  }, [isTimeRunning, timeDelta]);

  // Handle globe button click with GSAP animation
  const handleGlobeButtonClick = () => {
    setGlobeAnimationState((prevState) => !prevState); // Toggle globe animation state
    onGlobeButtonClick(!globeAnimationState); // Notify parent of the state change
  };

  // Increase timeDelta
  const handleIncreaseTimeDelta = () => {
    setTimeDelta((prevDelta) => prevDelta + 0.01); // Increase by 0.01
  };

  // Decrease timeDelta
  const handleDecreaseTimeDelta = () => {
    setTimeDelta((prevDelta) => Math.max(0.01, prevDelta - 0.01)); // Decrease by 0.01, but don't go below 0.01
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

      {/* Globe Button */}
      <button
        className="globe-icon"
        onClick={handleGlobeButtonClick}
        style={styles.globeButton}
      >
        <span style={styles.icon}>🌍</span>
      </button>

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
    fontSize: '32px', // Control the size of the button and the icon
    backgroundColor: 'lightgray', // Remove the background color
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
  globeButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '32px', // Adjust the font size for the globe icon
    backgroundColor: 'lightgray', // Remove background
    border: 'none',
    borderRadius: '20%',
    cursor: 'pointer',
  },
  icon: {
    fontSize: '28px', // Make the icons fill the button
    lineHeight: '32px',
  },
};

export default Controls;