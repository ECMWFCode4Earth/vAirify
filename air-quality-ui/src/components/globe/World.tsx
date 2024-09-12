import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import { CameraControls } from '@react-three/drei';
import { SurfaceLayer, SurfaceLayerRef } from './SurfaceLayer';
import LocationMarker, { LocationMarkerRef } from './LocationMarker'; // Updated LocationMarker with instancing
import Controls from './Controls';
import * as THREE from 'three';

type WorldProps = {
  forecastData: Record<string, ForecastResponseDto[]>;
  summarizedMeasurementData: Record<string, MeasurementSummaryResponseDto[]>;
};

const World = ({
  forecastData,
  summarizedMeasurementData,
}: WorldProps): JSX.Element => {
  const surface_layer_ref = useRef<SurfaceLayerRef>(null);
  const markerRef = useRef<LocationMarkerRef>(null); // Single ref for instanced markers
  const cameraControlsRef = useRef(null); // Ref for CameraControls


  const [isTimeRunning, setIsTimeRunning] = useState(true); // State to control time updates
  const [isLocationMarkerOn, setIsLocationMarkerOn] = useState(true); // State for location marker
  const [isFilterNearest, setGridFilterState] = useState(false); // State for enlarge button
  const [isTimeInterpolation, setTimeInterpolationState] = useState(false); // State for enlarge button
  const [selectedVariable, setSelectedVariable] = useState('aqi'); // State for selected variable from the dropdown

  // Function to toggle the time update on and off
  const toggleTimeUpdate = () => {
    setIsTimeRunning((prev) => !prev);
  };

  // Handle globe button state change
  const handleGlobeButtonClick = (globeState: boolean) => {
    surface_layer_ref.current?.changeProjection(globeState);
    markerRef.current?.changeProjection(globeState);

    console.log(cameraControlsRef)

    if (cameraControlsRef.current) {
      const controls = cameraControlsRef.current;

      console.log('reset camera')

      if (globeState) {
        // Move the camera to a new position, e.g., when the globe state is true
        controls.minDistance = 3.0
        controls.minPolarAngle = 0
        controls.maxPolarAngle = Math.PI 
        controls.minAzimuthAngle = - Infinity
        controls.maxAzimuthAngle = Infinity
    
        controls.dollyToCursor = false
    
      
          var lat = 50.
          var lon = 5.
          var newTheta = lon * THREE.MathUtils.DEG2RAD
          var newPhi = -1. * ( ( lat - 90. ) * THREE.MathUtils.DEG2RAD )
    
          // slower/smoother camera transition
          controls.smoothTime = 1.5;
          controls.rotateTo( newTheta, newPhi, true)
          controls.smoothTime = 1.0;

        controls.zoomTo( 0.75, true )


        console.log(controls.mouseButtons)

      } else {

          controls.minDistance = 1.0
          controls.minPolarAngle =  Math.PI *  0.5
          controls.maxPolarAngle = Math.PI *  1.0
          controls.minAzimuthAngle = 0
          controls.maxAzimuthAngle = 0
            
          controls.maxPolarAngle = Math.PI *  1.0
      
          controls.smoothTime = 1.0;
          controls.reset(true)
      
          // set camera smoothing back to normal after transition
          setTimeout(function(){
            controls.smoothTime = 3.0;
          }, 5000);
      
          controls.dollyToCursor = true
      
      
          // set map controls
          // controls.mouseButtons = {
          //   left: CameraControls.ACTION.TRUCK,
          //   middle: CameraControls.ACTION.DOLLY,
          //   wheel: CameraControls.ACTION.DOLLY,
          //   right: CameraControls.ACTION.ROTATE
          // }
        
          // controls.touches = {
          // one: CameraControls.ACTION.TOUCH_TRUCK,
          // two: CameraControls.ACTION.TOUCH_DOLLY,
          // three: CameraControls.ACTION.TOUCH_ROTATE,
          // }
      
        }
      // controls.reset(true);
    }

  };

  // Handle location marker button state change
  const handleLocationMarkerButtonClick = (locationMarkerState: boolean) => {
    setIsLocationMarkerOn(locationMarkerState);
    markerRef.current?.setVisible(locationMarkerState); // Update visibility for all markers
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
    markerRef.current?.tick(value, 0.0); // Update all markers with new value
  };


  return (
    <div style={styles.worldContainer}>
      <Canvas
        style={{ background: 'white', height: '80vh', width: '90%' }}
        camera={{ position: [0, 0, 1.5], near: 0.1, far: 1000 }}
        dpr={1}
        gl={{ antialias: true }}
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

        {/* Instanced LocationMarker */}
        <LocationMarker
          ref={markerRef} // Attach the ref to the instanced marker
          forecastData={forecastData} // Pass all forecast data
          measurementData={summarizedMeasurementData} // Pass all measurement data
          selectedVariable={selectedVariable} // Pass the selected variable to the marker
          isVisible={isLocationMarkerOn} // Pass the state for location marker visibility
        />

        <CameraControls ref={cameraControlsRef} />
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