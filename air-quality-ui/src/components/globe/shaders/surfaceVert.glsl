////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// define uniforms
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#define M_PI 3.14159265

uniform float uSphereWrapAmount;
uniform float uLayerHeight;
uniform float uHeightDisplacement; // Scale of the height displacement
uniform float thisDataMin[12]; 
uniform float thisDataMax[12];

uniform sampler2D dataTexture; // Heightmap texture

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// varying for fragment shader
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
varying vec2 vUv;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// define functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

vec3 anglesToSphereCoord(vec2 a, float r) {

    return vec3(
        r * sin(a.y) * sin(a.x),
        r * cos(a.y),
        r * sin(a.y) * cos(a.x)  
    );

}

// remap color range
float remap(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

// Adjusted remap function to handle user-defined min and max values
float userRemap(float value) {
    float uUserMinValue = -6000.0;
    float uUserMaxValue =  6000.0;

    if (value < 0.0) {
        return 0.5 * (value - uUserMinValue) / -uUserMinValue;
    } else {
        return 0.5 + 0.5 * value / uUserMaxValue;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// main program
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void main()	{

    float thisFrameData = remap( 
        texture2D(
            dataTexture, 
            uv
            ).r, 
        0.0, 
        1.0, 
        thisDataMin[0], 
        thisDataMax[0]);

    float dataRemapped = userRemap(thisFrameData);

        

    // Sample the heightmap texture
    // float height = texture2D(dataTexture, uv).r - 0.5;
    // float height = dataRemapped - 0.5;
    float height = 0.0;

    // standard plane position
    // vec3 modPosition = position;
    vec3 modPosition = position + normal * height * uHeightDisplacement;

    // calculate sphere position with radius increased by calculated z displacement
    vec2 angles = M_PI * vec2(2. * uv.x, uv.y - 1.);
    vec3 sphPos = anglesToSphereCoord(angles, 1.0 + height * uHeightDisplacement );

    // mix plane and sphere position based on chosen projection weight
    vec3 wrapPos = mix(modPosition, sphPos, uSphereWrapAmount);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4( wrapPos, 1.0 );

    vUv = uv;
}