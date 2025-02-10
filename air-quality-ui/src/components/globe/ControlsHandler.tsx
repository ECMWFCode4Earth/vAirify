// ControlsHandler.tsx
import React from 'react'

import Controls from './Controls'
import { ForecastResponseDto } from '../../services/types'

type ControlsHandlerProps = {
  toggleTimeUpdate: () => void
  handleSliderChange: (value: number) => void
  handleGlobeButtonClick: (globeState: boolean) => void
  handleLocationMarkerButtonClick: (locationMarkerState: boolean) => void
  handleGridFilterClick: (filterState: boolean) => void
  handleTimeInterpolationClick: (timeInterpolationState: boolean) => void
  handleVariableSelect: (variable: string) => void
  isTimeRunning: boolean
  forecastData: Record<string, ForecastResponseDto[]>
  isFullscreen: boolean
  onFullscreenToggle: () => void
  selectedVariable?: string
}

const ControlsHandler: React.FC<ControlsHandlerProps> = ({
  toggleTimeUpdate,
  handleSliderChange,
  handleGlobeButtonClick,
  handleLocationMarkerButtonClick,
  handleGridFilterClick,
  handleTimeInterpolationClick,
  handleVariableSelect,
  isTimeRunning,
  forecastData,
  isFullscreen = false,
  onFullscreenToggle,
  selectedVariable,
}) => {

  return (
    <Controls
      isTimeRunning={isTimeRunning}
      onToggleTimeUpdate={toggleTimeUpdate}
      onSliderChange={handleSliderChange}
      onGlobeButtonClick={handleGlobeButtonClick}
      onLocationMarkerClick={handleLocationMarkerButtonClick}
      onGridFilterClick={handleGridFilterClick}
      onTimeInterpolationClick={handleTimeInterpolationClick}
      onVariableSelect={handleVariableSelect}
      forecastData={forecastData}
      isFullscreen={isFullscreen}
      onFullscreenToggle={() => {
        console.log('Fullscreen toggle called in ControlsHandler')
        if (typeof onFullscreenToggle === 'function') {
          onFullscreenToggle()
        } else {
          console.error('onFullscreenToggle is not a function:', onFullscreenToggle)
        }
      }}
      selectedVariable={selectedVariable}
    />
  )
}

export default ControlsHandler
