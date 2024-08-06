////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// define uniforms
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
uniform float uLayerOpacity;
uniform float uFrameWeight;
uniform float thisDataMin[12]; 
uniform float thisDataMax[12];
uniform float uUserMinValue;
uniform float uUserMaxValue;
uniform float colorMapIndex;

uniform sampler2D thisDataTexture;
uniform sampler2D nextDataTexture;
uniform sampler2D colorMap;
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

// convert float to color via colormap
vec4 applyColormap(float t, sampler2D colormap, float index){
    return(texture2D(colormap,vec2(t, index / 23.0 + 1.0 / 23.0 )));
}

// remap color range
float remap(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

// Adjusted remap function to handle user-defined min and max values
float userRemap(float value) {
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

float cmap_index = colorMapIndex;
float opacity_cutoff = 0.0;

// convert relative bitmap value to absolute value for both frames
float thisFrameData = remap( 
    texture2D(
        thisDataTexture, 
        vUv
        ).r, 
    0.0, 
    1.0, 
    1.0, 
    7.0);

float nextFrameData = remap( 
    texture2D(
        nextDataTexture, 
        vUv
        ).r, 
    0.0, 
    1.0, 
    1.0, 
    7.0);

// interpolate between absolute values of both frames
float intData = mix(thisFrameData, nextFrameData, uFrameWeight);

// apply user scaling to data
// float dataRemapped = userRemap(intData);

// apply colormap to data
// vec4 dataColor = applyColormap( dataRemapped, colorMap, cmap_index );


// gl_FragColor = dataColor;
gl_FragColor = vec4(1.0);

// float testFrameData = remap( 
//     texture2D(
//         thisDataTexture, 
//         vUv
//         ).r, 
//     0.0, 
//     1.0, 
//     1.0, 
//     7.0);

vec3 color;

// Define colors for each range
if (intData >= 1.0 && intData < 2.0) {
    color = vec3(129., 237., 229.); // Red
} else if (intData >= 2.0 && intData < 3.0) {
    color = vec3(116.0, 201.0, 172.0); // Green
} else if (intData >= 3.0 && intData < 4.0) {
    color = vec3(238.0, 230.0, 97.0); // Blue
} else if (intData >= 4.0 && intData < 5.0) {
    color = vec3(236.0, 94.0, 87.0); // Yellow
} else if (intData >= 5.0 && intData < 6.0) {
    color = vec3(137.0, 26.0, 52.0); // Orange
} else if (intData >= 6.0 && intData < 7.0) {
    color = vec3(115.0, 40.0, 125.0); // Purple
} else {
    color = vec3(0.0, 0.0, 0.0); // Black for values out of range
}

gl_FragColor = vec4(color/255., 1.0);

// overlay lsmTexture
vec4 lsmColor = texture2D(lsmTexture, vUv);
// gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0), lsmColor.a);

gl_FragColor = mix(vec4(0.,0.,0.,1.),gl_FragColor,lsmColor.r);

// gl_FragColor = vec4(testFrameData, testFrameData, testFrameData, 1.0);
// gl_FragColor.a *= uLayerOpacity;

}