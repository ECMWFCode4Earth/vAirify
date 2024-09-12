// ControlsHandler.tsx
import React from 'react';
import Controls from './Controls';

type ControlsHandlerProps = {
  toggleTimeUpdate: () => void;
  handleSliderChange: (value: number) => void;
  handleGlobeButtonClick: (globeState: boolean) => void;
  handleLocationMarkerButtonClick: (locationMarkerState: boolean) => void;
  handleGridFilterClick: (filterState: boolean) => void;
  handleTimeInterpolationClick: (timeInterpolationState: boolean) => void;
  handleVariableSelect: (variable: string) => void;
  isTimeRunning: boolean;
  isLocationMarkerOn: boolean;
  isFilterNearest: boolean;
  isTimeInterpolation: boolean;
  selectedVariable: string;
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
  isLocationMarkerOn,
  isFilterNearest,
  isTimeInterpolation,
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
    />
  );
};

export default ControlsHandler;