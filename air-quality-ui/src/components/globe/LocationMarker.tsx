import { useRef, forwardRef, useImperativeHandle, useEffect, useReducer } from 'react';
import { DataTexture, RGBAFormat, FloatType } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ForecastResponseDto, MeasurementSummaryResponseDto } from '../../services/types';
import {
  PollutantDataDto,
} from '../../services/types'

type LocationMarkerProps = {
  forecastData: Record<string, ForecastResponseDto[]>;
  measurementData: Record<string, MeasurementSummaryResponseDto[]>;
  selectedVariable: string;
  isVisible: boolean;
  cameraControlsRef: React.RefObject<any>;
};

export type LocationMarkerRef = {
  tick: (weight: number) => void;
  changeProjection: (globeState: boolean) => void;
  setVisible: (isVisible: boolean) => void;
};

const shaderUniforms = {
  uSphereWrapAmount: { value: 0.0 },
  uFrameWeight: { value: 0.5 },
  uFrame: { value: 0.0 },
};

const createDataArrays = (
  forecastData: Record<string, ForecastResponseDto[]>,
  measurementData: Record<string, MeasurementSummaryResponseDto[]>,
  variable: string
) => {
  let variable_name: keyof ForecastResponseDto;

  if (variable === 'aqi') {
    variable_name = 'overall_aqi_level' as keyof ForecastResponseDto;
  } else {
    variable_name = variable as keyof ForecastResponseDto;
  }

  const forecastDataArray: number[] = [];
  const measurementDataArray: number[] = [];

  Object.keys(forecastData).forEach((city) => {
    const cityForecastData = forecastData[city];
    const cityMeasurementData = measurementData[city] || [];

    cityForecastData.forEach((forecastEntry) => {
      const forecastValue = forecastEntry[variable_name as keyof typeof forecastEntry];
    
      if (forecastValue !== undefined && forecastValue !== null) {
        if (variable === 'aqi') {
          if (typeof forecastValue === 'number') {
            forecastDataArray.push(forecastValue);
          }
        } else {
          if (typeof forecastValue === 'object' && 'value' in forecastValue) {
            const value = (forecastValue as PollutantDataDto).value;
            if (typeof value === 'number') {
              forecastDataArray.push(value);
            }
          }
        }
      }
    });

    cityForecastData.forEach((forecastEntry) => {
      const matchingMeasurement = cityMeasurementData.find(
        (measurementEntry) =>
          measurementEntry.measurement_base_time === forecastEntry.valid_time
      );
    
      if (variable === 'aqi') {
        const measurementValue =
          matchingMeasurement && matchingMeasurement[variable_name as keyof MeasurementSummaryResponseDto]
            ? (matchingMeasurement[variable_name as keyof MeasurementSummaryResponseDto] as any).mean
            : -1;
        measurementDataArray.push(measurementValue);
      } else {
        const measurementValue =
          matchingMeasurement && matchingMeasurement[variable_name as keyof MeasurementSummaryResponseDto]
            ? (matchingMeasurement[variable_name as keyof MeasurementSummaryResponseDto] as any).mean.value
            : -1.0;
        measurementDataArray.push(measurementValue);
      }
    });
  });


  const forecastDataVec4Array = new Float32Array(forecastDataArray.length * 4);
  const measurementDataVec4Array = new Float32Array(measurementDataArray.length * 4);

  const numCities = Object.keys(forecastData).length;
  const numEntries = forecastDataArray.length / numCities;

  for (let row = 0; row < numEntries; row++) {
    for (let col = 0; col < numCities; col++) {
      const index = col * numEntries + row; 
      const columnMajorIndex = row * numCities + col; 

      forecastDataVec4Array.set([forecastDataArray[index], 0, 0, 0], columnMajorIndex * 4);
      measurementDataVec4Array.set([measurementDataArray[index], 0, 0, 0], columnMajorIndex * 4);
    }
  }

  return { forecastDataVec4Array, measurementDataVec4Array };
};

const LocationMarker = forwardRef<LocationMarkerRef, LocationMarkerProps>(
  ({ forecastData, measurementData, selectedVariable, isVisible, cameraControlsRef }, ref): JSX.Element | null => {
   
    if (
      !forecastData || 
      Object.keys(forecastData).length === 0 || 
      !measurementData || 
      Object.keys(measurementData).length === 0
    ) {
      return null;
    }
    
    type InstancedMeshWithUniforms = THREE.InstancedMesh & {
      material: THREE.ShaderMaterial | THREE.ShaderMaterial;
    };

    const instancedMarkerRef = useRef<InstancedMeshWithUniforms>(null);

    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const forecastDataTexture = useRef<DataTexture>();
    const measurementDataTexture = useRef<DataTexture>();

    let MAX_MARKERS = Object.keys(forecastData).length;

    const latitudes = new Float32Array(MAX_MARKERS);
    const longitudes = new Float32Array(MAX_MARKERS);

    useEffect(() => {
      forceUpdate();
    }, [selectedVariable, forecastData, measurementData]); 

    useEffect(() => {
      const firstKey = Object.keys(forecastData)[0]; 
      let numEntries = forecastData[firstKey].length;

      const { forecastDataVec4Array, measurementDataVec4Array } = createDataArrays(forecastData, measurementData, selectedVariable);

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

    useEffect(() => {
      if (instancedMarkerRef.current) {

        instancedMarkerRef.current.visible = isVisible;

        let i = 0;
        Object.keys(forecastData).forEach((city) => {
          const lat = forecastData[city][0]?.location.latitude || 0;
          const lon = forecastData[city][0]?.location.longitude || 0;

          latitudes[i] = lat;
          longitudes[i] = lon;

          i++;
        });

        const markerIndices = new Float32Array(MAX_MARKERS);
        for (let i = 0; i < MAX_MARKERS; i++) {
          markerIndices[i] = i;
        }
        instancedMarkerRef.current.geometry.setAttribute('lat', new THREE.InstancedBufferAttribute(latitudes, 1));
        instancedMarkerRef.current.geometry.setAttribute('lon', new THREE.InstancedBufferAttribute(longitudes, 1));
        instancedMarkerRef.current.geometry.setAttribute('markerIndex', new THREE.InstancedBufferAttribute(markerIndices, 1));
        instancedMarkerRef.current.instanceMatrix.needsUpdate = true;
      }
    }, [forecastData, measurementData, selectedVariable]);

    const scaleBasedOnZoom = () => {
      if (instancedMarkerRef.current && cameraControlsRef.current) {
        const controls = cameraControlsRef.current;
        const distance = controls.distance; 
        const scaleFactor = distance ;
        instancedMarkerRef.current.material.uniforms.uZoomLevel.value = scaleFactor;
      }
    };

    useEffect(() => {
      if (instancedMarkerRef.current) {
        instancedMarkerRef.current.frustumCulled = false; 
      }
    }, []);

    useFrame(() => {
      scaleBasedOnZoom();
    });

    const tick = (weight: number) => {
      shaderUniforms.uFrameWeight.value = weight % 1;
      shaderUniforms.uFrame.value = parseFloat(Math.floor(weight).toFixed(1));
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

    const variableIndex = selectedVariable === "aqi" ? 1 :
    selectedVariable === "pm2_5" ? 2 :
    selectedVariable === "pm10" ? 3 :
    selectedVariable === "o3" ? 4 :
    selectedVariable === "no2" ? 5 :
    selectedVariable === "so2" ? 6 : undefined;

    return (
      <instancedMesh ref={instancedMarkerRef} args={[undefined, undefined, MAX_MARKERS]}>
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
                if (value == -1.0) {
                  color = vec3(38, 38, 38); // Default to dark grey for missing values
                } else if (value >= 1.0 && value < 2.0) {
                  color = vec3(129.0, 237.0, 229.0);
                } else if (value >= 2.0 && value < 3.0) {
                  color = vec3(116.0, 201.0, 172.0);
                } else if (value >= 3.0 && value < 4.0) {
                  color = vec3(238.0, 230.0, 97.0);
                } else if (value >= 4.0 && value < 5.0) {
                  color = vec3(236.0, 94.00, 87.0);
                } else if (value >= 5.0 && value < 6.0) {
                  color = vec3(137.0, 26.0, 52.0);
                } else if (value >= 6.0 && value < 7.0) {
                  color = vec3(115.0, 40.0, 125.0);
                } else {
                  color = vec3(38, 38, 38); // Default to dark grey
              }
              } else if ( (uVariableIndex == 2.0) || (uVariableIndex == 3.0) ){ // "pm25 and pm10"
                if (value == -1.0) {
                  color = vec3(38, 38, 38); // Default to dark grey for missing values
                } else if (value < 30.0) {
                    color = vec3(255.0, 255.0, 255.0); 
                } else if (value < 40.0) {
                    color = vec3(233.0, 249.0, 188.0); // Green
                } else if (value < 50.0) {
                    color = vec3(198.0, 255.0, 199.0); // Blue
                } else if (value < 60.0) {
                    color = vec3(144.0, 237.0, 169.0); // Yellow
                } else if (value < 80.0) {
                    color = vec3(76.0, 180.0, 148.0); // Orange
                } else if (value < 100.0) {
                    color = vec3(48.0, 155.0, 138.0); // Purple
                } else if (value < 150.0) {
                    color = vec3(47.0, 137.0, 169.0); // Yellow
                } else if (value < 200.0) {
                    color = vec3(16.0, 99.0, 164.0); // Orange
                } else if (value < 300.0) {
                    color = vec3(13.0, 69.0, 126.0); // Purple
                } else if (value < 500.0) {
                    color = vec3(15.0, 26.0, 136.0); // Orange
                } else if (value < 1000.0) {
                    color = vec3(38.0, 2.0, 60.0); // Purple
                } else {
                    color = vec3(0.0, 0.0, 0.0); // Black for values out of range
              }
              } else if (uVariableIndex == 4.0) { // "o3"
                if (value < 10.0) {
                    color = vec3(144.0, 190.0, 228.0); // Red
                } else if (value < 20.0) {
                    color = vec3(20.0, 145.0, 216.0); // Green
                } else if (value < 30.0) {
                    color = vec3(15.0, 109.0, 179.0); // Blue
                } else if (value < 40.0) {
                    color = vec3(35.0, 79.0, 146.0); // Yellow
                } else if (value < 50.0) {
                    color = vec3(37.0, 133.0, 100.0); // Orange
                } else if (value < 60.0) {
                    color = vec3(96.0, 168.0, 83.0); // Purple
                } else if (value < 70.0) {
                    color = vec3(157.0, 193.0, 99.0); // Yellow
                } else if (value < 80.0) {
                    color = vec3(255.0,242.0, 148.0); // Orange
                } else if (value < 90.0) {
                    color = vec3(240.0, 203.0, 62.0); // Purple
                } else if (value < 100.0) {
                    color = vec3(229.0, 172.0, 59.0); // Orange
                } else if (value < 120.0) {
                    color = vec3(214.0, 124.0, 62.0); // Purple
                } else if (value < 150.0) {
                    color = vec3(196.0, 49.0, 50.0); // Purple
                } else {
                    color = vec3(142.0, 25.0, 35.0); // Black for values out of range
                }
            }
                
            color = color / 255.0;

              return color;
            }

            #define M_PI 3.14159265

            uniform float uVariableIndex;
            uniform float uSphereWrapAmount;
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
            } else if ( (uVariableIndex == 2.0) || (uVariableIndex == 3.0) ) {
                minValue = 1.0;
                maxValue = 1000.0;
            } else if (uVariableIndex == 4.0) {
                minValue = 1.0;
                maxValue = 500.0;
          }
            forecastValue = clamp(forecastValue, minValue, maxValue);
            // if (measurementValue > 0.0) {
              // measurementValue = clamp(measurementValue, minValue, maxValue);
            // }
            nextForecastValue = clamp(nextForecastValue, minValue, maxValue);
            nextMeasurementValue = clamp(nextMeasurementValue, minValue, maxValue);

            if (measurementValue != -1.0) {
              thisDiff = abs(measurementValue-forecastValue);
            } else {
              thisDiff = 0.0;
            }
            if (nextMeasurementValue != -1.0) {
              nextDiff = abs(nextMeasurementValue-nextForecastValue);
            } else {
              nextDiff = 0.0;
            }
            diff = mix(thisDiff, nextDiff, uFrameWeight);

            if (uVariableIndex == 1.0) {
                diff = clamp(diff * 0.8, 1.0, 6.0);
            } else if ( (uVariableIndex == 2.0) || (uVariableIndex == 3.0) ) {
                diff = clamp(diff/20.0, 1.0, 4.0);
            } else if (uVariableIndex == 4.0) {
                diff = clamp(diff/30.0, 1.0, 5.0);
            }

            if ( measurementValueInterpolated < 0.0 ) {
              diff = 0.5;
            }

            vec3 color;
            // if ( (measurementValueInterpolated > 0.0 ) || (diff > 1.0) ) {
            if ( (measurementValueInterpolated > 0.0 )  ) {
                color = getColorForValue(measurementValue, uVariableIndex); 
            } else {
                // color = getColorForValue(0.0, uVariableIndex); 
                color = vec3(0.15, 0.15, 0.15); 
            }
            // color = getColorForValue(measurementValue, uVariableIndex); 

            
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
                    posPlane += position * diff * uZoomLevel * 0.8;
                    posSphere += position * diff * uZoomLevel * 0.3;
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
            uVariableIndex: { value: variableIndex },
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