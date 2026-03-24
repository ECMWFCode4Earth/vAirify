import { PollutantType } from './types'

export type VariableType = PollutantType | 'aqi'

export function getVariableIndex(selectedVariable: VariableType): number | undefined {
  return selectedVariable === 'aqi'
    ? 1
    : selectedVariable === 'pm2_5'
      ? 2
      : selectedVariable === 'pm10'
        ? 3
        : selectedVariable === 'no2'
          ? 4
          : selectedVariable === 'o3'
            ? 5
            : selectedVariable === 'so2'
              ? 6
              : undefined
} 