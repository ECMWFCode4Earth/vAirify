import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Mesh } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';

type LocationMarkerProps = {
  forecastData: ForecastResponseDto;
  measurementData: MeasurementSummaryResponseDto;
  thisRotationsFrame: THREE.Texture;
  nextRotationsFrame: THREE.Texture;
};

export type LocationMarkerRef = {
  tick: (weight: number, uSphereWrapAmount: number) => void;
  changeProjection: (globeState: boolean) => void;
};


const LocationMarker = forwardRef<LocationMarkerRef, LocationMarkerProps>(
  ({ forecastData, measurementData, thisRotationsFrame, nextRotationsFrame }, ref): JSX.Element => {
    const markerRef = useRef<Mesh>(null);
    const ringRef = useRef<Mesh>(null); // Ref for the ring geometry
    const { camera } = useThree(); // Access the camera
    const prevCameraPosition = useRef(camera.position.clone()); // Store previous camera position

    // Uniform values from props or calculations
    const lat = forecastData[0].location.latitude;
    const lon = forecastData[0].location.longitude;

    // Extract point data from forecastData
    const forecastDataArray = forecastData.map((data) => data.overall_aqi_level);
    const forecastDataArrayUniform = new Float32Array(forecastDataArray);

    // and the same array for the average measurement data
    const measurementArray = forecastData.map((forecastEntry) => {
        // Find a corresponding measurement entry by matching valid_time and measurement_base_time
        const matchingMeasurement = measurementData?.find(
        (measurementEntry) => measurementEntry.measurement_base_time === forecastEntry.valid_time
        );
    
        // If a matching measurement is found, return the overall_aqi_level, otherwise return a missing value (e.g., -1)
        return matchingMeasurement ? matchingMeasurement.overall_aqi_level.mean : -1;
    });
    
    const measurementDataArrayUniform = new Float32Array(measurementArray);
    

    // Animation or build time (example values)
    const shaderUniforms = {
      uSphereWrapAmount: { value: 0.0 },
      uFrameWeight: { value: 0.5 },
    };

    const markerSize = 0.025;
    const markerColor = [0.25, 0.25, 0.25]; // Example color

    // Scale based on camera zoom or position
    const scaleBasedOnZoom = () => {
        if (markerRef.current) {
            // Calculate scale based on the camera's distance from the origin
            const distance = camera.position.z; // Use camera's distance from the origin
            const scaleFactor = distance / 10; // Adjust the denominator to control the sensitivity of the scaling
    
            markerRef.current.material.uniforms.uZoomLevel.value = scaleFactor
            console.log(markerRef.current.material.uniforms.uZoomLevel.value)
        }
        };

    // // Track camera movement and apply scaling
    // useFrame(() => {
    //     // Check if the z-axis of the camera has changed
    //     if (camera.position.z !== prevCameraPosition.current.z) {
    //       scaleBasedOnZoom(); // Adjust scale when the z-axis changes
    //       prevCameraPosition.current.z = camera.position.z; // Update the z-axis position only
    //     }
    //   });

    // Implement the tick function
    const tick = (weight: number, uSphereWrapAmount: number) => {
      if (markerRef.current) {
        markerRef.current.material.uniforms.uFrameWeight.value = weight % 1;
        markerRef.current.material.uniforms.uFrame.value = Math.floor(weight);
      }
    //   scaleBasedOnZoom(); // Scale based on current zoom whenever tick is called
    };

    const changeProjection = (globeState: boolean) => {
        if (markerRef.current) {
          if ( globeState ) {
            gsap.to(markerRef.current.material.uniforms.uSphereWrapAmount, { value: 1.0, duration: 2 });
            ringRef.current.visible = false; // Show the ring in flat projection
          } else {
            gsap.to(markerRef.current.material.uniforms.uSphereWrapAmount, { value: 0.0, duration: 2, onComplete: () => {
                ringRef.current.visible = true; // Show the ring in flat projection
            }});
          } 
        }
      };

      const setVariableSize = (enlargedState: boolean) => {
        if (markerRef.current) {
            markerRef.current.material.uniforms.uVariableSize.value = enlargedState;
        }
      };


      const setVisible = (isVisible: boolean) => {
        if (markerRef.current) {
          markerRef.current.visible = isVisible;
        }
      };

    // Expose the tick method to the parent component
    useImperativeHandle(ref, () => ({
      tick,
      changeProjection,
      setVariableSize,
      setVisible
    }));

    return (
      <mesh ref={markerRef} position={[0.0, 0.0, 0.0]} castShadow receiveShadow>
        <sphereGeometry args={[markerSize, 16, 16]} />

        {/* CustomShaderMaterial from the custom-shader-material library */}
        <CustomShaderMaterial
          baseMaterial={THREE.MeshLambertMaterial}
          vertexShader={`

            vec3 adjustSaturation(vec3 color, float saturation) {
              float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
              return mix(vec3(luminance), color, saturation);
            }

            // Function to get color based on the value and variable type
            vec3 getColorForValue(float value, int variableType) {
              vec3 color;
              
              if (variableType == 1) { // "aqi"
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
              }
              // Add more variable types as needed
              else {
                color = vec3(1.0, 1.0, 1.0); // Default to white
              }

              return color;
            }

            #define M_PI 3.14159265

            uniform float uSphereWrapAmount;
            uniform float uLat;
            uniform float uLon;
            uniform float uForecastData[40];
            uniform float uMeasurementData[40];
            uniform int uFrame;
            uniform int uVariableType;
            uniform float uFrameWeight;
            uniform float uZoomLevel;
            uniform bool uVariableSize;

            varying vec3 vColor;

            void main() {

            // Call the color function to get the color based on AQI value and variable type
            //   float intData = uAqiForecast[uFrame]; // Access the correct frame data
            //   vec3 thisColor = getColorForValue(uAqiForecast[uFrame], uVariableType);
            //   vec3 color = mix(thisColor, thisColor, uFrameWeight); 
            // float forecastValue = mix(uForecastData[uFrame],uForecastData[uFrame+1],uFrameWeight);
            // float measurementValue = mix(uMeasurementData[uFrame],uMeasurementData[uFrame+1],uFrameWeight);
            float forecastValue = uForecastData[uFrame];
            float measurementValue = uMeasurementData[uFrame];

            float nextForecastValue = uForecastData[uFrame+1];
            float nextMeasurementValue = uMeasurementData[uFrame+1];

            float forecastValueInterpolated = mix(forecastValue, nextForecastValue, uFrameWeight);
            float measurementValueInterpolated = mix(measurementValue, nextMeasurementValue, uFrameWeight);

            float thisDiff; 
            float nextDiff; 
            float diff = 1.0;

            forecastValue = clamp(forecastValue, 1.0, 6.0);
            measurementValue = clamp(measurementValue, 1.0, 6.0);
            nextForecastValue = clamp(nextForecastValue, 1.0, 6.0);
            nextMeasurementValue = clamp(nextMeasurementValue, 1.0, 6.0);

            // if ( (forecastValue > 0.0) && (measurementValue > 0.0) ) {
            //     thisDiff = abs(measurementValue-forecastValue);
            //     // if ( (nextForecastValue > 0.0) && (nextMeasurementValue > 0.0) ) {
            //         nextDiff = abs(nextMeasurementValue-nextForecastValue);
            //         diff = mix(thisDiff, nextDiff, uFrameWeight);
            //     // }
            //     // diff = thisDiff;

            // } else { 
            //     diff = 1.0;
            // }
            // if (diff < 1.0) {
            //     diff = 1.0;
            // }

            thisDiff = abs(measurementValue-forecastValue);
            nextDiff = abs(nextMeasurementValue-nextForecastValue);
            diff = mix(thisDiff, nextDiff, uFrameWeight);
            diff = clamp(diff, 1.0, 6.0);

            vec3 color;
            if ( (measurementValueInterpolated > 0.0 ) || (diff > 1.0) ) {
                color = getColorForValue(measurementValue, uVariableType); 
            } else {
                color = getColorForValue(0.0, uVariableType); 
            }
            vColor = adjustSaturation(color, 2.0); // Increase saturation

              float lat = uLat;
              float lon = uLon;

            //   vec3 posPlane = position * 1.1 * uZoomLevel ;
              vec3 posPlane = position * 0.3 ;
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
            uFrame: { value: 0 },
            uLat: { value: lat },
            uLon: { value: lon },
            uColor: { value: markerColor },
            uOpacity: { value: 1.0 },
            uForecastData: { value: forecastDataArrayUniform },
            uMeasurementData: { value: measurementDataArrayUniform },
            uVariableType: { value: 1 }, // Example variable type
          }}
          transparent
        />

        {/* Add a ring for the equator line */}
        <mesh ref={ringRef} rotation={[0, 0, 0]} position={[lon / 180.0 * 2.0, lat / 180.0 * 2.0, 0.001 ]}>
          <ringGeometry args={[markerSize - 0.02, markerSize + 0.015, 64]} />
          <meshBasicMaterial color="black" side={THREE.DoubleSide} />
        </mesh>
      </mesh>
    );
  }
);

export default LocationMarker;