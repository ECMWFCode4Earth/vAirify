import React, { useRef, useState } from 'react'; // Add this import
import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf'
import { OrbitControls } from '@react-three/drei';
import { SurfaceLayer, SurfaceLayerRef } from './SurfaceLayer';
import LocationMarker, { LocationMarkerRef } from './LocationMarker.loop';
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
  const [isLocationMarkerOn, setIsLocationMarkerOn] = useState(false); // State for location marker
  const [isFilterNearest, setGridFilterState] = useState(false); // State for enlarge button
  const [isTimeInterpolation, setTimeInterpolationState] = useState(false); // State for enlarge button
  const [selectedVariable, setSelectedVariable] = useState("aqi"); // State for selected variable from the dropdown

  // Function to toggle the time update on and off
  const toggleTimeUpdate = () => {
    setIsTimeRunning((prev) => !prev);
  };

  // Handle globe button state change
  const handleGlobeButtonClick = (globeState: boolean) => {
    surface_layer_ref.current?.changeProjection(globeState);
    markerRefs.current.forEach((ref) => {
      if (ref?.current) {
        ref.current.changeProjection(globeState);
      }
    });
  };

  // Handle location marker button state change
  const handleLocationMarkerButtonClick = (locationMarkerState: boolean) => {
    setIsLocationMarkerOn(locationMarkerState);
    markerRefs.current.forEach((ref) => {
      if (ref?.current) {
        ref.current.setVisible(locationMarkerState);
      }
    });
  };

  // Handle grid filter button state change
  const handleGridFilterClick = (filterState: boolean) => {
    setGridFilterState(filterState);
    surface_layer_ref.current?.changeFilter(filterState);
  };

  // Handle time interpolation button state change
  const handleTimeInterpolationClick = (timeInterpolationState: boolean) => {
    setTimeInterpolationState(timeInterpolationState);
    surface_layer_ref.current?.changeTimeInterpolation(timeInterpolationState);
  };

  // Handle dropdown variable selection
  const handleVariableSelect = (variable: string) => {
    setSelectedVariable(variable); // Update the selected variable state
  };

  // Function to handle slider change
  const handleSliderChange = (value: number) => {
    surface_layer_ref.current?.tick(value, 0.0);
    markerRefs.current.forEach((ref) => {
      if (ref.current) ref.current.tick(value, 0.0); // Update each marker with new value
    });
  };

  return (
    <div style={styles.worldContainer}>
      <Canvas
        style={{ background: 'white', height: '600px', width: '100%' }}
        camera={{ position: [0, 0, 1.5], near: 0.1, far: 1000 }}
        dpr={ 1 }
        gl={ {
            antialias: true,
        } }
      >
        <ambientLight />
        <directionalLight position={[0, 5, 0]} />
        <SurfaceLayer
          ref={surface_layer_ref}
          forecastData={forecastData}
          summarizedMeasurementData={summarizedMeasurementData}
          isFilterNearest={isFilterNearest} // Pass the state for grid filtering
          isTimeInterpolation={isTimeInterpolation} // Pass the state for time interpolation
          selectedVariable={selectedVariable} // Pass the selected variable from the dropdown
        />

        {Object.keys(forecastData).map((key, index) => {
          const forecastSubset = forecastData[key];
          const measurementSubset = summarizedMeasurementData[key];

          if (!markerRefs.current[index]) {
            markerRefs.current[index] = React.createRef<LocationMarkerRef>();
          }

          return (
            <LocationMarker
              key={index}
              ref={markerRefs.current[index]} // Attach the ref to the marker
              forecastData={forecastSubset} // Passing the forecast data for this index
              measurementData={measurementSubset} // Passing the measurement data for this index
              isLocationMarkerOn={isLocationMarkerOn} // Pass the location marker state
              selectedVariable={selectedVariable} // Pass the selected variable to the marker
            />
          );
        })}

        <OrbitControls />
        <Perf position="top-left" />
      </Canvas>

      <Controls
        isTimeRunning={isTimeRunning}
        onToggleTimeUpdate={toggleTimeUpdate}
        onSliderChange={handleSliderChange}
        onGlobeButtonClick={handleGlobeButtonClick}
        onLocationMarkerClick={handleLocationMarkerButtonClick} // Pass to Controls
        onGridFilterClick={handleGridFilterClick} // Pass to Controls
        onTimeInterpolationClick={handleTimeInterpolationClick} // Pass to Controls
        onVariableSelect={handleVariableSelect} // Pass to Controls
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
