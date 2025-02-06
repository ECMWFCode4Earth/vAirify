import { CameraControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { CSSProperties, useRef, useState, useEffect } from 'react'

import CameraSettings from './CameraSettings'
import ControlsHandler from './ControlsHandler'
import LocationMarker, { LocationMarkerRef } from './LocationMarker'
import { SurfaceLayer, SurfaceLayerRef } from './SurfaceLayer'
import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../../services/types'

type WorldProps = {
  forecastData: Record<string, ForecastResponseDto[]>
  summarizedMeasurementData: Record<string, MeasurementSummaryResponseDto[]>
  toggle: string
}

const World = ({
  forecastData,
  summarizedMeasurementData,
  toggle,
}: WorldProps): JSX.Element => {
  const surface_layer_ref = useRef<SurfaceLayerRef>(null)
  const markerRef = useRef<LocationMarkerRef>(null)
  const cameraControlsRef = useRef(null)

  const [isTimeRunning, setIsTimeRunning] = useState(true)
  const [isLocationMarkerOn, setIsLocationMarkerOn] = useState(true)
  const [isFilterNearest, setGridFilterState] = useState(false)
  const [isTimeInterpolation, setTimeInterpolationState] = useState(true)
  const [selectedVariable, setSelectedVariable] = useState('aqi')
  const [globeState, setGlobeState] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleTimeUpdate = () => setIsTimeRunning((prev) => !prev)

  const handleGlobeButtonClick = (globeState: boolean) => {
    setGlobeState(globeState)
    surface_layer_ref.current?.changeProjection(globeState)
    markerRef.current?.changeProjection(globeState)
  }

  const handleLocationMarkerButtonClick = (locationMarkerState: boolean) => {
    setIsLocationMarkerOn(locationMarkerState)
    markerRef.current?.setVisible(locationMarkerState)
  }

  const handleGridFilterClick = (filterState: boolean) => {
    setGridFilterState(filterState)
    surface_layer_ref.current?.changeFilter(filterState)
  }

  const handleTimeInterpolationClick = (timeInterpolationState: boolean) => {
    setTimeInterpolationState(timeInterpolationState)
    surface_layer_ref.current?.changeTimeInterpolation(timeInterpolationState)
  }

  const handleVariableSelect = (variable: string) => {
    setSelectedVariable(variable)
  }

  const handleSliderChange = (value: number) => {
    surface_layer_ref.current?.tick(value)
    markerRef.current?.tick(value)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  return (
    <div 
      style={{
        ...styles.worldContainer,
        ...(isFullscreen && styles.fullscreenContainer),
      }}
    >
      <div style={styles.canvasContainer}>
        <Canvas
          style={{ 
            background: 'white', 
            height: '100%',
            width: '100%' 
          }}
          camera={{ position: [0, 0, 1.4], near: 0.01, far: 1000 }}
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

          {!forecastData ||
          Object.keys(forecastData).length === 0 ||
          !summarizedMeasurementData ||
          Object.keys(summarizedMeasurementData).length === 0 ? null : (
            <LocationMarker
              ref={markerRef}
              forecastData={forecastData}
              measurementData={summarizedMeasurementData}
              selectedVariable={selectedVariable}
              isVisible={isLocationMarkerOn}
              cameraControlsRef={cameraControlsRef}
            />
          )}

          <CameraControls ref={cameraControlsRef} />

          <CameraSettings
            globeState={globeState}
            cameraControlsRef={cameraControlsRef}
            toggle={toggle}
          />
        </Canvas>
        <div style={styles.controlsOverlay}>
          <ControlsHandler
            toggleTimeUpdate={toggleTimeUpdate}
            handleSliderChange={handleSliderChange}
            handleGlobeButtonClick={handleGlobeButtonClick}
            handleLocationMarkerButtonClick={handleLocationMarkerButtonClick}
            handleGridFilterClick={handleGridFilterClick}
            handleTimeInterpolationClick={handleTimeInterpolationClick}
            handleVariableSelect={handleVariableSelect}
            isTimeRunning={isTimeRunning}
            forecastData={forecastData}
            isFullscreen={isFullscreen}
            onFullscreenToggle={handleFullscreenToggle}
          />
        </div>
      </div>
    </div>
  )
}

const styles: {
  worldContainer: CSSProperties
  fullscreenContainer: CSSProperties
  canvasContainer: CSSProperties
  controlsOverlay: CSSProperties
} = {
  worldContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '270px',
    position: 'relative',
    maxWidth: 'none',
    overflow: 'hidden',
  },
  fullscreenContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 'none',
    height: '100vh',
    overflow: 'hidden',
  },
  canvasContainer: {
    position: 'relative',
    flex: 1,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    minHeight: 0,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    backgroundColor: 'rgba(244, 244, 244, 0.9)',
    borderRadius: '8px',
    padding: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
}

export default World
