import React, { useRef, useState } from 'react'; // Add this import
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SurfaceLayer, SurfaceLayerRef } from './SurfaceLayer';
import LocationMarker, { LocationMarkerRef } from './LocationMarker';
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
  const markerRefs = useRef<LocationMarkerRef[]>([]); // Array of refs for LocationMarkers
  const [isTimeRunning, setIsTimeRunning] = useState(true); // State to control time updates

  // Function to toggle the time update on and off
  const toggleTimeUpdate = () => {
    setIsTimeRunning((prev) => !prev);
  };

  const handleGlobeButtonClick = (globeState: boolean) => {
    surface_layer_ref.current?.changeProjection(globeState);

    // Loop through all marker refs and call tick method
    markerRefs.current.forEach((ref) => {
      if (ref.current) ref.current.changeProjection(globeState); // Update each marker with new value
      // ref?.tick(value, 0.0); // Update each marker with new value
    });
  };
  
  // Function to handle slider change
  const handleSliderChange = (value: number) => {
    surface_layer_ref.current?.tick(value, 0.0);

    // Loop through all marker refs and call tick method
    markerRefs.current.forEach((ref) => {
      if (ref.current) ref.current.tick(value, 0.0); // Update each marker with new value
      // ref?.tick(value, 0.0); // Update each marker with new value
    });
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
        />

        {Object.keys(forecastData).map((key, index) => {
          const forecastSubset = forecastData[key];
          const measurementSubset = summarizedMeasurementData[key];

          // Properly create a ref for each marker using createRef
          if (!markerRefs.current[index]) {
            markerRefs.current[index] = React.createRef<LocationMarkerRef>();
          }

          return (
            <LocationMarker
              key={index}
              ref={markerRefs.current[index]} // Attach the ref to the marker
              forecastData={forecastSubset} // Passing the forecast data for this index
              measurementData={measurementSubset} // Passing the measurement data for this index
            />
          );
        })}

        <OrbitControls />
      </Canvas>

      {/* Render Controls component below the canvas */}
      <Controls
        isTimeRunning={isTimeRunning}
        onToggleTimeUpdate={toggleTimeUpdate}
        onSliderChange={handleSliderChange} // Handle slider value changes
        onGlobeButtonClick={handleGlobeButtonClick}
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