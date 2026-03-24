////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// define uniforms
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
uniform float uLayerOpacity;
uniform float uFrameWeight;
uniform float uContourThresholds[20];
uniform vec3 uContourColors[20];
uniform int uNumLevels;
uniform float uMinValue;
uniform float uMaxValue;

uniform sampler2D thisDataTexture;
uniform sampler2D nextDataTexture;
uniform sampler2D lsmTexture;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// varying from vertex shader
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// define functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// remap color range
float remap(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// main program
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void main()	{
    // convert relative bitmap value to absolute value for both frames
    float thisFrameData = remap( 
        texture2D(
            thisDataTexture, 
            vUv
        ).r, 
        0.0, 
        1.0, 
        uMinValue, 
        uMaxValue);

    float nextFrameData = remap( 
        texture2D(
            nextDataTexture, 
            vUv
        ).r, 
        0.0, 
        1.0, 
        uMinValue, 
        uMaxValue);

    // interpolate between absolute values of both frames
    float intData = mix(thisFrameData, nextFrameData, uFrameWeight);

    gl_FragColor = vec4(1.0);

    vec3 color;

    // Find appropriate color from contour levels
    bool colorFound = false;
    for (int i = 0; i < 20; i++) {
        if (i >= uNumLevels) break;
        if (intData < uContourThresholds[i]) {
            color = uContourColors[i];
            colorFound = true;
            break;
        }
    }

    // If no threshold matched, use the last color
    if (!colorFound) {
        color = uContourColors[uNumLevels - 1];
    }

    gl_FragColor = vec4(color/255., 1.0);

    // overlay lsmTexture
    vec4 lsmColor = texture2D(lsmTexture, vUv);

    gl_FragColor = mix(vec4(0.,0.,0.,1.),gl_FragColor,lsmColor.r);
}