import { pollutantContours, hexToRgb } from '../../../models/pollutant-contours'

const MAX_LEVELS = 20 // Maximum number of contour levels we'll support in the shader

export function createContourUniforms(selectedVariable: string) {
  const contour = pollutantContours[selectedVariable as keyof typeof pollutantContours]
  if (!contour) return null

  // Create arrays for thresholds and colors
  const thresholds = new Float32Array(MAX_LEVELS).fill(Infinity)
  const colors = new Float32Array(MAX_LEVELS * 3).fill(0)

  // Fill arrays with actual values
  contour.levels.forEach((level, i) => {
    if (i < MAX_LEVELS) {
      thresholds[i] = level.threshold
      const [r, g, b] = hexToRgb(level.color)
      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }
  })

  return {
    uContourThresholds: { value: thresholds },
    uContourColors: { value: colors },
    uNumLevels: { value: contour.levels.length },
    uMinValue: { value: contour.minValue },
    uMaxValue: { value: contour.maxValue }
  }
} 