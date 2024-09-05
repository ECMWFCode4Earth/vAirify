import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import { SurfaceLayer, SurfaceLayerRef } from './SurfaceLayer';
import Controls from './Controls';

type WorldProps = {
  forecastData: Record<string, ForecastResponseDto[]>;
  summarizedMeasurementData: Record<string, MeasurementSummaryResponseDto[]>;
};

const World = ({
  forecastData,
  summarizedMeasurementData,
}: WorldProps): JSX.Element => {
  const surface_layer_ref = useRef<SurfaceLayerRef>(null);
  const [isTimeRunning, setIsTimeRunning] = useState(true); // State to control time updates
  const [sliderValue, setSliderValue] = useState(0.5); // State for the slider value

  // Function to toggle the time update on and off
  const toggleTimeUpdate = () => {
    setIsTimeRunning((prev) => !prev);
  };

  // Function to handle slider change
  const handleSliderChange = (value: number) => {
    surface_layer_ref.current?.tick(value, 0.0);
    // setSliderValue(value);
  };

  return (
    <div style={styles.worldContainer}>
      <Canvas
        style={{ background: 'white', height: '600px', width: '100%' }}
        camera={{ position: [0, 0, 1.5], near: 0.1, far: 1000 }}
      >
        <ambientLight />
        <directionalLight position={[0, 5, 0]} />
        <SurfaceLayer
          ref={surface_layer_ref}
          forecastData={forecastData}
          summarizedMeasurementData={summarizedMeasurementData}
          isTimeRunning={isTimeRunning} // Pass the time control state
          sliderValue={sliderValue} // Pass the slider value
        />
        <OrbitControls />
      </Canvas>

      {/* Render Controls component below the canvas */}
      <Controls
        isTimeRunning={isTimeRunning}
        onToggleTimeUpdate={toggleTimeUpdate}
        onSliderChange={handleSliderChange} // Handle slider value changes
      />
    </div>
  );
};

const styles = {
  worldContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};

export default World;