import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Mesh } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import * as THREE from 'three';

type LocationMarkerProps = {
  forecastData: ForecastResponseDto;
  measurementData: MeasurementSummaryResponseDto;
  thisRotationsFrame: THREE.Texture;
  nextRotationsFrame: THREE.Texture;
};

export type LocationMarkerRef = {
  tick: (weight: number, uSphereWrapAmount: number) => void;
};


const LocationMarker = forwardRef<LocationMarkerRef, LocationMarkerProps>(
  ({ forecastData, measurementData, thisRotationsFrame, nextRotationsFrame }, ref): JSX.Element => {
    const markerRef = useRef<Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null); // Ref for the material

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
    
    if ( forecastData[0].location_name === "Cape Town") {
        console.log(measurementData)
        console.log(measurementDataArrayUniform)
    }

    // Animation or build time (example values)
    const shaderUniforms = {
      uSphereWrapAmount: { value: 0.0 },
      uFrameWeight: { value: 0.5 },
    };

    const markerSize = 0.025;
    const markerColor = [0.25, 0.25, 0.25]; // Example color

    // Implement the tick function
    const tick = (weight: number, uSphereWrapAmount: number) => {
      if (markerRef.current) {
        markerRef.current.material.uniforms.uFrameWeight.value = weight;
        markerRef.current.material.uniforms.uFrame.value = Math.floor(weight);
      }
    };

    // Expose the tick method to the parent component
    useImperativeHandle(ref, () => ({
      tick,
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

            uniform float uSphereWrapAmount;
            uniform float uLat;
            uniform float uLon;
            uniform float uForecastData[40];
            uniform float uMeasurementData[40];
            uniform int uFrame;
            uniform int uVariableType;
            uniform float uFrameWeight;

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
            float diff; 
            if ( (measurementValue > 0.0) && (forecastValue > 0.0) ) {
                diff = abs(measurementValue-forecastValue);
            } else { 
                diff = 1.0;
            }
            if (diff < 1.0) {
                diff = 1.0;
            }

              vec3 color = getColorForValue(measurementValue, uVariableType); 

              vColor = adjustSaturation(color, 2.0); // Increase saturation

              float lat = uLat;
              float lon = uLon;

              vec3 posPlane = position * diff;
              posPlane.x += lon / 180.0 * 2.0;
              posPlane.y += lat / 90.0;

              csm_Position = posPlane;

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
        <mesh rotation={[0, 0, 0]} position={[lon / 180.0 * 2.0, lat / 180.0 * 2.0, 0.001]}>
          <ringGeometry args={[markerSize - 0.01, markerSize + 0.005, 64]} />
          <meshBasicMaterial color="black" side={THREE.DoubleSide} />
        </mesh>
      </mesh>
    );
  }
);

export default LocationMarker;