import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import { SurfaceLayer, SurfaceLayerRef } from './SurfaceLayer';

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

  // Function to toggle the time update on and off
  const toggleTimeUpdate = () => {
    setIsTimeRunning((prev) => !prev);
  };

  return (
    <>
      {/* Button to toggle time update */}
      <button
        onClick={toggleTimeUpdate}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1,
          padding: '10px',
          backgroundColor: isTimeRunning ? 'red' : 'green',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {isTimeRunning ? 'Pause Time' : 'Resume Time'}
      </button>

      <Canvas
        style={{ background: 'white', height: '600px', width: '100%' }}
        camera={{ position: [0, 0, 1.5], near: 0.1, far: 1000 }} // Set initial camera position
      >
        <ambientLight />
        <directionalLight position={[0, 5, 0]} />
        {/* Pass forecastData, summarizedMeasurementData, and isTimeRunning to SurfaceLayer */}
        <SurfaceLayer
          ref={surface_layer_ref}
          forecastData={forecastData}
          summarizedMeasurementData={summarizedMeasurementData}
          isTimeRunning={isTimeRunning} // Pass the state down
        />
        <OrbitControls />
      </Canvas>
    </>
  );
};

export default World;