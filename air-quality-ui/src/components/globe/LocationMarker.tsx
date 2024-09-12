import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { InstancedMesh, Object3D, DataTexture, RGBAFormat, FloatType } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { Float } from '@react-three/drei';

type LocationMarkerProps = {
  forecastData: Record<string, ForecastResponseDto[]>;
  measurementData: Record<string, MeasurementSummaryResponseDto[]>;
  selectedVariable: string;
  isVisible: boolean;
};

export type LocationMarkerRef = {
  tick: (weight: number, uSphereWrapAmount: number) => void;
  changeProjection: (globeState: boolean) => void;
  setVisible: (isVisible: boolean) => void;
};

// Uniforms used in the custom shader material
const shaderUniforms = {
  uSphereWrapAmount: { value: 0.0 },
  uFrameWeight: { value: 0.5 },
  uFrame: { value: 0.0 },
};

// Utility function to flatten forecast and measurement data
const createDataArrays = (
  forecastData: Record<string, ForecastResponseDto[]>,
  measurementData: Record<string, MeasurementSummaryResponseDto[]>,
  variable: string
) => {
  let variable_name;
  if (variable === 'aqi') {
    variable_name = 'overall_aqi_level';
  } else if (variable === 'pm10') {
    variable_name = 'pm10';
  }

  const forecastDataArray: number[] = [];
  const measurementDataArray: number[] = [];

  // Loop through each city and process forecast and measurement data
  Object.keys(forecastData).forEach((city) => {
    const cityForecastData = forecastData[city];
    const cityMeasurementData = measurementData[city] || []; // Measurement data may be missing for some cities

    // Process forecast data
    cityForecastData.forEach((forecastEntry) => {
      const forecastValue = forecastEntry[variable_name];
      forecastDataArray.push(forecastValue);
    });

    // Process measurement data by matching valid_time with measurement_base_time
    cityForecastData.forEach((forecastEntry) => {
      const matchingMeasurement = cityMeasurementData.find(
        (measurementEntry) =>
          measurementEntry.measurement_base_time === forecastEntry.valid_time
      );

      if (variable === 'aqi') {
        // For AQI, return the overall_aqi_level.mean, or -1 if no match is found
        const measurementValue =
          matchingMeasurement && matchingMeasurement[variable_name]
            ? matchingMeasurement[variable_name].mean
            : -1;
        measurementDataArray.push(measurementValue);
      } else {
        // For PM10, return the overall_aqi_level.mean.value, or -1 if no match is found
        const measurementValue =
          matchingMeasurement && matchingMeasurement[variable_name]
            ? matchingMeasurement[variable_name].mean.value
            : -1;
        measurementDataArray.push(measurementValue);
      }
    });
  });

  // Convert the data into vec4 (RGBA format)
  const forecastDataVec4Array = new Float32Array(forecastDataArray.length * 4);
  const measurementDataVec4Array = new Float32Array(measurementDataArray.length * 4);


  const numCities = Object.keys(forecastData).length;
  const numEntries = forecastDataArray.length / numCities;

  // Fill the vec4 array in column-major order (column-first layout)
  for (let row = 0; row < numEntries; row++) {
    for (let col = 0; col < numCities; col++) {
      const index = col * numEntries + row; // Row-major index
      const columnMajorIndex = row * numCities + col; // Column-major index

      // Place the value in the red channel of the vec4
      forecastDataVec4Array.set([forecastDataArray[index], 0, 0, 0], columnMajorIndex * 4);
      measurementDataVec4Array.set([measurementDataArray[index], 0, 0, 0], columnMajorIndex * 4);
    }
  }


  return { forecastDataVec4Array, measurementDataVec4Array };
};

const LocationMarker = forwardRef<LocationMarkerRef, LocationMarkerProps>(
  ({ forecastData, measurementData, selectedVariable, isVisible }, ref): JSX.Element => {
    const instancedMarkerRef = useRef<InstancedMesh>(null);

    const [triggerRender, setTriggerRender] = useState(0); // Using a number state for forcing render

    const { camera } = useThree(); // Access the camera

    // Create textures for forecast and measurement data
    const forecastDataTexture = useRef<DataTexture>();
    const measurementDataTexture = useRef<DataTexture>();

    let MAX_MARKERS = Object.keys(forecastData).length; // Calculate dynamically based on forecastData length

    // Arrays to store latitude and longitude for each marker
    const latitudes = new Float32Array(MAX_MARKERS);
    const longitudes = new Float32Array(MAX_MARKERS);

    // Listen for changes in selectedVariable and trigger re-render
    useEffect(() => {
      // Trigger state update to force re-render
      setTriggerRender((prev) => prev + 1);
    }, [selectedVariable]); // Depend on `selectedVariable`

    useEffect(() => {
      const firstKey = Object.keys(forecastData)[0]; // Get the first key
      let numEntries = forecastData[firstKey].length;

      const { forecastDataVec4Array, measurementDataVec4Array } = createDataArrays(forecastData, measurementData, selectedVariable);

      // Create textures for forecast and measurement data
      forecastDataTexture.current = new DataTexture(forecastDataVec4Array, MAX_MARKERS, numEntries, RGBAFormat, FloatType);
      forecastDataTexture.current.needsUpdate = true;
      forecastDataTexture.current.minFilter = THREE.NearestFilter
      forecastDataTexture.current.magFilter = THREE.NearestFilter

      measurementDataTexture.current = new DataTexture(measurementDataVec4Array, MAX_MARKERS, numEntries, RGBAFormat, FloatType);
      measurementDataTexture.current.needsUpdate = true;
      measurementDataTexture.current.minFilter = THREE.NearestFilter
      measurementDataTexture.current.magFilter = THREE.NearestFilter
    }, [forecastData, measurementData, selectedVariable]);


    const markerSize = 0.025;

    // Initialize markers' positions and other properties
    useEffect(() => {
      if (instancedMarkerRef.current) {

        instancedMarkerRef.current.visible = isVisible;

        let i = 0;
        Object.keys(forecastData).forEach((city) => {
          const lat = forecastData[city][0]?.location.latitude || 0;
          const lon = forecastData[city][0]?.location.longitude || 0;

          // store lat and lon in the arrays
          latitudes[i] = lat;
          longitudes[i] = lon;

          i++;
        });

        // Set markerIndex attribute (used in the shader to reference the correct data point)
        const markerIndices = new Float32Array(MAX_MARKERS);
        for (let i = 0; i < MAX_MARKERS; i++) {
          markerIndices[i] = i; // Each marker gets its index
        }
        instancedMarkerRef.current.geometry.setAttribute('lat', new THREE.InstancedBufferAttribute(latitudes, 1));
        instancedMarkerRef.current.geometry.setAttribute('lon', new THREE.InstancedBufferAttribute(longitudes, 1));
        instancedMarkerRef.current.geometry.setAttribute('markerIndex', new THREE.InstancedBufferAttribute(markerIndices, 1));
        instancedMarkerRef.current.instanceMatrix.needsUpdate = true;
      }
    }, [forecastData, measurementData, selectedVariable]);

    // Scale based on camera zoom or position
    const scaleBasedOnZoom = () => {
      if (instancedMarkerRef.current) {
        const distance = camera.position.z; // Camera distance from origin
        const scaleFactor = distance / 10; // Adjust scale sensitivity
        instancedMarkerRef.current.material.uniforms.uZoomLevel.value = scaleFactor;
      }
    };

    useFrame(() => {
      // Dynamically update scale based on camera distance
      scaleBasedOnZoom();
    });

    // Implement the tick function
    const tick = (weight: number, uSphereWrapAmount: number) => {
      shaderUniforms.uFrameWeight.value = weight % 1;
      // shaderUniforms.uFrameWeight.value = 0.0;
      shaderUniforms.uFrame.value = Math.floor(weight).toFixed(1);
    };

    const changeProjection = (globeState: boolean) => {
      gsap.to(shaderUniforms.uSphereWrapAmount, { value: globeState ? 1.0 : 0.0, duration: 2 });
    };

    const setVisible = (isVisible: boolean) => {
      if (instancedMarkerRef.current) {
        instancedMarkerRef.current.visible = isVisible;
      }
    };

    useImperativeHandle(ref, () => ({
      tick,
      changeProjection,
      setVisible
    }));

    return (
      <instancedMesh ref={instancedMarkerRef} args={[null, null, MAX_MARKERS]}>
        <sphereGeometry args={[markerSize, 16, 16]} />
        <CustomShaderMaterial
          baseMaterial={THREE.MeshLambertMaterial}
          vertexShader={`

            vec3 adjustSaturation(vec3 color, float saturation) {
              float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
              return mix(vec3(luminance), color, saturation);
            }

            // Function to get color based on the value and variable type
            vec3 getColorForValue(float value, float uVariableIndex) {
              vec3 color;
              
              if (uVariableIndex == 1.0) { // "aqi"
                if (value >= 1.0 && value < 2.0) {
                  color = vec3(129.0 / 255.0, 237.0 / 255.0, 229.0 / 255.0);
                } else if (value >= 2.0 && value < 3.0) {
                  color = vec3(116.0 / 255.0, 201.0 / 255.0, 172.0 / 255.0);
                } else if (value >= 3.0 && value < 4.0) {
                  color = vec3(238.0 / 255.0, 230.0 / 255.0, 97.0 / 255.0);
                } else if (value >= 4.0 && value < 5.0) {
                  color = vec3(236.0 / 255.0, 94.0 / 255.0, 87.0 / 255.0);
                } else if (value >= 5.0 && value < 6.0) {
                  color = vec3(137.0 / 255.0, 26.0 / 255.0, 52.0 / 255.0);
                } else if (value >= 6.0 && value < 7.0) {
                  color = vec3(115.0 / 255.0, 40.0 / 255.0, 125.0 / 255.0);
                } else {
                  color = vec3(0.15, 0.15, 0.15); // Default to dark grey
                }
              } else if (uVariableIndex == 2.0) { // "pm10"
                if (value < 30.0) {
                    color = vec3(1.0, 1.0, 1.0); 
                } else if (value < 40.0) {
                    color = vec3(233.0/ 255.0, 249.0/ 255.0, 188.0/ 255.0); // Green
                } else if (value < 50.0) {
                    color = vec3(198.0/ 255.0, 255.0/ 255.0, 199.0/ 255.0); // Blue
                } else if (value < 60.0) {
                    color = vec3(144.0/ 255.0, 237.0/ 255.0, 169.0/ 255.0); // Yellow
                } else if (value < 80.0) {
                    color = vec3(76.0/ 255.0, 180.0/ 255.0, 148.0/ 255.0); // Orange
                } else if (value < 100.0) {
                    color = vec3(48.0/ 255.0, 155.0/ 255.0, 138.0/ 255.0); // Purple
                } else if (value < 150.0) {
                    color = vec3(47.0/ 255.0, 137.0/ 255.0, 169.0/ 255.0); // Yellow
                } else if (value < 200.0) {
                    color = vec3(16.0/ 255.0, 99.0/ 255.0, 164.0/ 255.0); // Orange
                } else if (value < 300.0) {
                    color = vec3(13.0/ 255.0, 69.0/ 255.0, 126.0/ 255.0); // Purple
                } else if (value < 500.0) {
                    color = vec3(15.0/ 255.0, 26.0/ 255.0, 136.0/ 255.0); // Orange
                } else if (value < 1000.0) {
                    color = vec3(38.0/ 255.0, 2.0/ 255.0, 60.0/ 255.0); // Purple
                } else {
                    color = vec3(0.0, 0.0, 0.0); // Black for values out of range
                }
            }

              return color;
            }

            #define M_PI 3.14159265

            uniform float uVariableIndex;
            uniform float uSphereWrapAmount;
            uniform float uForecastData[100];
            uniform float uMeasurementData[100];
            uniform float uFrame;
            uniform float uFrameWeight;
            uniform float uZoomLevel;
            uniform float uMaxMarkers;
            uniform float uNumTimseSteps;
            uniform bool uVariableSize;

            uniform sampler2D forecastTexture;
            uniform sampler2D measurementTexture;

            attribute float lat;
            attribute float lon;
            attribute float markerIndex;

            varying vec3 vColor;

            void main() {

            vec2 thisTexCoord = vec2(markerIndex / (uMaxMarkers - 1.0), uFrame / uNumTimseSteps);
            vec2 nextTexCoord = vec2(markerIndex / (uMaxMarkers - 1.0), (uFrame + 1.0 ) / uNumTimseSteps);

            float forecastValue = texture2D(forecastTexture, thisTexCoord).r;
            float measurementValue = texture2D(measurementTexture, thisTexCoord).r;

            float nextForecastValue = texture2D(forecastTexture, nextTexCoord).r;
            float nextMeasurementValue = texture2D(measurementTexture, nextTexCoord).r;

            float forecastValueInterpolated = mix(forecastValue, nextForecastValue, uFrameWeight);
            float measurementValueInterpolated = mix(measurementValue, nextMeasurementValue, uFrameWeight);

            float thisDiff; 
            float nextDiff; 
            float diff = 1.0;

            float minValue;
            float maxValue;

            if (uVariableIndex == 1.0) {
                minValue = 1.0;
                maxValue = 6.0;
            } else if (uVariableIndex == 2.0) {
                minValue = 0.0;
                maxValue = 1000.0;
            }

            forecastValue = clamp(forecastValue, minValue, maxValue);
            measurementValue = clamp(measurementValue, minValue, maxValue);
            nextForecastValue = clamp(nextForecastValue, minValue, maxValue);
            nextMeasurementValue = clamp(nextMeasurementValue, minValue, maxValue);

            thisDiff = abs(measurementValue-forecastValue);
            nextDiff = abs(nextMeasurementValue-nextForecastValue);
            diff = mix(thisDiff, nextDiff, uFrameWeight);

            if (uVariableIndex == 1.0) {
                diff = clamp(diff * 0.8, 1.0, 6.0);
            } else if (uVariableIndex == 2.0) {
                diff = clamp(diff/20.0, 1.0, 4.0);
            }

            vec3 color;
            if ( (measurementValueInterpolated > 0.0 ) || (diff > 1.0) ) {
                color = getColorForValue(measurementValue, uVariableIndex); 
            } else {
                color = getColorForValue(0.0, uVariableIndex); 
            }
            
            vColor = adjustSaturation(color, 2.0); // Increase saturation  

            // Apply initial scale to the position
            vec3 posPlane = position * 0.3;

            // Add longitude and latitude to position, normalizing for the spherical projection
              posPlane.x += lon / 180.0 * 2.0;
              posPlane.y += lat / 90.0;
            

              float r = 1.0;
              float theta = 2. * M_PI * (posPlane.x / 4. + 0.5);
              float phi = M_PI * (posPlane.y / 2. + 0.5 - 1.0);
              float sinPhiRadius = sin( phi ) * r;

              vec3 posSphere;
              posSphere.x = sinPhiRadius * sin(theta);
              posSphere.y = r * cos(phi);
              posSphere.z = sinPhiRadius * cos(theta);

                if (uVariableSize) {
                    posPlane += position * diff;
                    posSphere += position * diff;
                } else {
                    posPlane += position;
                    posSphere += position;
                }

                csm_Position = mix(posPlane, posSphere, uSphereWrapAmount) ;

            //   csm_Position = posPlane;

            }
          `}
          fragmentShader={`

            uniform float uOpacity;
            varying vec3 vColor;

            
            void main() {


              csm_DiffuseColor = vec4(vColor, uOpacity); // Apply the color to the fragment

            }
          `}
          uniforms={{
            uSphereWrapAmount: shaderUniforms.uSphereWrapAmount,
            uFrameWeight: shaderUniforms.uFrameWeight,
            uZoomLevel: { value: 0.11 },
            uVariableSize: { value: true },
            uFrame: shaderUniforms.uFrame,
            uOpacity: { value: 1.0 },
            forecastTexture: { value: forecastDataTexture.current },
            measurementTexture: { value: measurementDataTexture.current },
            uVariableIndex: { value: selectedVariable === 'aqi' ? 1 : 2 },
            uMaxMarkers: { value: forecastDataTexture.current?.image.width },
            uNumTimseSteps: { value: forecastDataTexture.current?.image.height },
          }}
          transparent
        />
      </instancedMesh>
    );
  }



);

export default LocationMarker;