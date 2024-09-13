// ControlsHandler.tsx
import React from 'react';
import Controls from './Controls';
import {
  ForecastResponseDto,
} from '../../services/types'

type ControlsHandlerProps = {
  toggleTimeUpdate: () => void;
  handleSliderChange: (value: number) => void;
  handleGlobeButtonClick: (globeState: boolean) => void;
  handleLocationMarkerButtonClick: (locationMarkerState: boolean) => void;
  handleGridFilterClick: (filterState: boolean) => void;
  handleTimeInterpolationClick: (timeInterpolationState: boolean) => void;
  handleVariableSelect: (variable: string) => void;
  isTimeRunning: boolean;
  forecastData: Record<string, ForecastResponseDto[]>;
};

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
    />
  );
};

export default ControlsHandler;