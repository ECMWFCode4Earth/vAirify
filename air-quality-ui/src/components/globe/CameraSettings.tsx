// CameraSettings.tsx
import React, { useEffect } from 'react';
import * as THREE from 'three';

type CameraSettingsProps = {
  globeState: boolean;
  cameraControlsRef: React.RefObject<any>;
  toggle: string;
};

const CameraSettings: React.FC<CameraSettingsProps> = ({ globeState, cameraControlsRef, toggle }) => {
  useEffect(() => {
    if (cameraControlsRef.current) {

        console.log('render camera settings');
        console.log(globeState)
      const controls = cameraControlsRef.current;

      if (globeState) {
        // Globe settings
        controls.minDistance = 1.2;
        controls.maxDistance = 1.6;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;
        controls.minAzimuthAngle = -Infinity;
        controls.maxAzimuthAngle = Infinity;
        controls.dollyToCursor = false;

        controls.mouseButtons.left = 1;
        controls.mouseButtons.right = 2;

        const lat = 48.0;
        const lon = 8.0;
        const newTheta = lon * THREE.MathUtils.DEG2RAD;
        const newPhi = -1.0 * (lat - 90) * THREE.MathUtils.DEG2RAD;
        controls.reset(false);

        controls.smoothTime = 1.5;
        controls.rotateTo(newTheta, newPhi, true);
        controls.zoomTo(0.75, true);

        setTimeout(() => {
          controls.smoothTime = 1.0;
        }, 3000);
      } else {
        // Map settings
        controls.minDistance = 0.25;
        controls.maxDistance = 1.7;
        controls.minPolarAngle = Math.PI * 0.5;
        controls.maxPolarAngle = Math.PI * 1.0;
        controls.minAzimuthAngle = 0;
        controls.maxAzimuthAngle = 0;
        controls.dollyToCursor = true;

        controls.mouseButtons.left = 2;
        controls.mouseButtons.right = 1;

        controls.smoothTime = 1.0;
        controls.reset(true);

        setTimeout(() => {
          controls.smoothTime = 3.0;
        }, 5000);
      }
    }
  }, [globeState, cameraControlsRef, toggle]);

  return null;
};

export default CameraSettings;