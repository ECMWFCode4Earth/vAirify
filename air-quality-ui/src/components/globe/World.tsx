import { CameraControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { CSSProperties, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

import CameraSettings from './CameraSettings'
import ControlsHandler from './ControlsHandler'
import LocationMarker, { LocationMarkerRef } from './LocationMarker'
import { SurfaceLayer, SurfaceLayerRef } from './SurfaceLayer'
import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../../services/types'
import { ColorBar } from './ColorBar'
import { PollutantType } from '../../models/types'
import { pollutantTypeDisplay } from '../../models/pollutant-display'

interface WorldProps {
  forecastData: Record<string, ForecastResponseDto[]>
  summarizedMeasurementData: Record<string, MeasurementSummaryResponseDto[]>
  selectedCity?: {
    name: string
    latitude: number
    longitude: number
  } | null
  selectedVariable?: string
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

const World = ({
  forecastData,
  summarizedMeasurementData,
  selectedCity,
  selectedVariable: externalSelectedVariable,
  isFullscreen,
  onToggleFullscreen
}: WorldProps): JSX.Element => {
  const surface_layer_ref = useRef<SurfaceLayerRef>(null)
  const markerRef = useRef<LocationMarkerRef>(null)
  const cameraControlsRef = useRef<CameraControls | null>(null)

  const [isTimeRunning, setIsTimeRunning] = useState(true)
  const [isLocationMarkerOn, setIsLocationMarkerOn] = useState(true)
  const [isFilterNearest, setGridFilterState] = useState(false)
  const [isTimeInterpolation, setTimeInterpolationState] = useState(true)
  const [globeState, setGlobeState] = useState(false)

  // Map aqiLevel to aqi before setting the state
  const mappedVariable = externalSelectedVariable === 'aqiLevel' ? 'aqi' : externalSelectedVariable
  const [selectedVariable, setSelectedVariable] = useState(mappedVariable || 'aqi')

  // Default camera position
  const defaultCameraPosition = {
    phi: Math.PI / 2, // 90 degrees
    theta: Math.PI,    // 180 degrees
    distance: 1.4
  }

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

  // Add debug statements to fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      console.log('Fullscreen change event triggered')
      console.log('document.fullscreenElement:', document.fullscreenElement)
      if (!document.fullscreenElement && typeof onToggleFullscreen === 'function') {
        console.log('Exiting fullscreen, calling onToggleFullscreen')
        onToggleFullscreen()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [onToggleFullscreen])

  useEffect(() => {
    if (selectedCity && cameraControlsRef.current) {
      const controls = cameraControlsRef.current
      const { latitude, longitude } = selectedCity

      // Switch to globe view when zooming to a city
      if (!globeState) {
        setGlobeState(true)
        surface_layer_ref.current?.changeProjection(true)
        markerRef.current?.changeProjection(true)
      }

      const phi = (90 - latitude) * THREE.MathUtils.DEG2RAD
      const theta = (longitude) * THREE.MathUtils.DEG2RAD
      
      controls.rotateTo(theta, phi, true)
      controls.dollyTo(0.3, true)
      controls.smoothTime = 1.0
    } else if (cameraControlsRef.current) {
      // Reset to default position when no city is selected
      const controls = cameraControlsRef.current
      
      // Switch back to map view
      if (globeState) {
        setGlobeState(false)
        surface_layer_ref.current?.changeProjection(false)
        markerRef.current?.changeProjection(false)
      }

      controls.rotateTo(defaultCameraPosition.theta, defaultCameraPosition.phi, true)
      controls.dollyTo(defaultCameraPosition.distance, true)
      controls.smoothTime = 1.0
    }
  }, [selectedCity, globeState])

  // Update useEffect to handle the mapping
  useEffect(() => {
    if (externalSelectedVariable) {
      const mappedVar = externalSelectedVariable === 'aqiLevel' ? 'aqi' : externalSelectedVariable
      setSelectedVariable(mappedVar)
    }
  }, [externalSelectedVariable])

  // Update the fullscreen toggle handler
  const handleFullscreenToggle = () => {
    console.log('World: Fullscreen toggle clicked')
    console.log('World: Current fullscreen state:', isFullscreen)
    console.log('World: document.fullscreenElement:', document.fullscreenElement)
    console.log('World: requestFullscreen available:', !!document.documentElement.requestFullscreen)
    
    try {
      if (!isFullscreen) {
        console.log('World: Attempting to enter fullscreen')
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
            .then(() => {
              console.log('World: Entered fullscreen successfully')
              if (typeof onToggleFullscreen === 'function') {
                onToggleFullscreen()
              } else {
                console.error('World: onToggleFullscreen is not a function')
              }
            })
            .catch(err => {
              console.error('World: Error entering fullscreen:', err)
            })
        } else {
          console.warn('World: requestFullscreen not available')
        }
      } else {
        console.log('World: Attempting to exit fullscreen')
        if (document.exitFullscreen) {
          document.exitFullscreen()
            .then(() => {
              console.log('World: Exited fullscreen successfully')
              if (typeof onToggleFullscreen === 'function') {
                onToggleFullscreen()
              } else {
                console.error('World: onToggleFullscreen is not a function')
              }
            })
            .catch(err => {
              console.error('World: Error exiting fullscreen:', err)
            })
        } else {
          console.warn('World: exitFullscreen not available')
        }
      }
    } catch (err) {
      console.error('World: Error in fullscreen toggle:', err)
    }
  }

  return (
    <div style={isFullscreen ? styles.fullscreenContainer : styles.worldContainer}>
      <div style={styles.title}>
        circle colour: obs value (black=no data); circle size: obs minus fc
      </div>
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
          />
        </Canvas>
        <ColorBar 
          pollutant={selectedVariable as PollutantType | 'aqi'} 
          width={isFullscreen ? 80 : 60}
          height={isFullscreen ? 300 : 200}
        />
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
            selectedVariable={selectedVariable}
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
  title: CSSProperties
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
    paddingTop: '6px',
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
    marginTop: '6px',
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
  title: {
    fontSize: '12px',
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
    top: '0px',
    zIndex: 1,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: 'normal'
  }
}

export default World
