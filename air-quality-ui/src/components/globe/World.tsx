// World.tsx
import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
// import { Perf } from 'r3f-perf';
import { CameraControls } from '@react-three/drei';
import { SurfaceLayer, SurfaceLayerRef } from './SurfaceLayer';
import LocationMarker, { LocationMarkerRef } from './LocationMarker';
import CameraSettings from './CameraSettings'; // Import the CameraSettings component
import ControlsHandler from './ControlsHandler'; // Import the ControlsHandler component

type WorldProps = {
  forecastData: Record<string, ForecastResponseDto[]>;
  summarizedMeasurementData: Record<string, MeasurementSummaryResponseDto[]>;
};

const World = ({
  forecastData,
  summarizedMeasurementData,
}: WorldProps): JSX.Element => {
  const surface_layer_ref = useRef<SurfaceLayerRef>(null);
  const markerRef = useRef<LocationMarkerRef>(null);
  const cameraControlsRef = useRef(null);

  const [isTimeRunning, setIsTimeRunning] = useState(true);
  const [isLocationMarkerOn, setIsLocationMarkerOn] = useState(true);
  const [isFilterNearest, setGridFilterState] = useState(false);
  const [isTimeInterpolation, setTimeInterpolationState] = useState(true);
  const [selectedVariable, setSelectedVariable] = useState('aqi');
  const [globeState, setGlobeState] = useState(false);

  const toggleTimeUpdate = () => setIsTimeRunning((prev) => !prev);

  const handleGlobeButtonClick = (globeState: boolean) => {
    setGlobeState(globeState);
    surface_layer_ref.current?.changeProjection(globeState);
    markerRef.current?.changeProjection(globeState);
  };

  const handleLocationMarkerButtonClick = (locationMarkerState: boolean) => {
    setIsLocationMarkerOn(locationMarkerState);
    markerRef.current?.setVisible(locationMarkerState);
  };

  const handleGridFilterClick = (filterState: boolean) => {
    setGridFilterState(filterState);
    surface_layer_ref.current?.changeFilter(filterState);
  };

  const handleTimeInterpolationClick = (timeInterpolationState: boolean) => {
    setTimeInterpolationState(timeInterpolationState);
    surface_layer_ref.current?.changeTimeInterpolation(timeInterpolationState);
  };

  const handleVariableSelect = (variable: string) => {
    setSelectedVariable(variable);
  };

  const handleSliderChange = (value: number) => {
    surface_layer_ref.current?.tick(value);
    markerRef.current?.tick(value);
  };

  return (
    <div style={styles.worldContainer}>
      <Canvas
        style={{ background: 'white', height: '80vh', width: '90%' }}
        camera={{ position: [0, 0, 1.4], near: .01, far: 1000 }}
        dpr={1}
        gl={{ antialias: true }}
      >
        <ambientLight />
        <directionalLight position={[0, 5, 0]} />
        <SurfaceLayer
          ref={surface_layer_ref}
          isFilterNearest={isFilterNearest}
          isTimeInterpolation={isTimeInterpolation}
          selectedVariable={selectedVariable}
        />

        <LocationMarker
          ref={markerRef}
          forecastData={forecastData}
          measurementData={summarizedMeasurementData}
          selectedVariable={selectedVariable}
          isVisible={isLocationMarkerOn}
        />

        <CameraControls ref={cameraControlsRef} />
        {/* <Perf position="top-left" /> */}

        <CameraSettings globeState={globeState} cameraControlsRef={cameraControlsRef} />
      </Canvas>

      <ControlsHandler
        toggleTimeUpdate={toggleTimeUpdate}
        handleSliderChange={handleSliderChange}
        handleGlobeButtonClick={handleGlobeButtonClick}
        handleLocationMarkerButtonClick={handleLocationMarkerButtonClick}
        handleGridFilterClick={handleGridFilterClick}
        handleTimeInterpolationClick={handleTimeInterpolationClick}
        handleVariableSelect={handleVariableSelect}
        isTimeRunning={isTimeRunning}
        isLocationMarkerOn={isLocationMarkerOn}
        isFilterNearest={isFilterNearest}
        isTimeInterpolation={isTimeInterpolation}
        selectedVariable={selectedVariable}
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