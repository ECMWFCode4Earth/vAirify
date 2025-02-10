import { PollutantType } from './types'

export interface ContourLevel {
  threshold: number
  color: string
}

export interface PollutantContours {
  minValue: number
  maxValue: number
  levels: ContourLevel[]
}

export const pollutantContours: Record<PollutantType | 'aqi', PollutantContours> = {
  aqi: {
    minValue: 1.0,
    maxValue: 7.0,
    levels: [
      { threshold: 2.0, color: '#81EDEA' },  // rgb(129, 237, 229)
      { threshold: 3.0, color: '#74C9AC' },  // rgb(116, 201, 172)
      { threshold: 4.0, color: '#EEE661' },  // rgb(238, 230, 97)
      { threshold: 5.0, color: '#EC5E57' },  // rgb(236, 94, 87)
      { threshold: 6.0, color: '#891A34' },  // rgb(137, 26, 52)
      { threshold: 7.0, color: '#73287D' },  // rgb(115, 40, 125)
    ]
  },
  pm2_5: {
    minValue: 0.0,
    maxValue: 500.0,
    levels: [
      { threshold: 2.0, color: '#C7EAF4' },   // rgb(199, 234, 244)
      { threshold: 5.0, color: '#B4E0EC' },   // rgb(180, 224, 236)
      { threshold: 10.0, color: '#A1D6E4' },  // rgb(161, 214, 228)
      { threshold: 20.0, color: '#C0E0CE' },  // rgb(192, 224, 206)
      { threshold: 30.0, color: '#ECEFB4' },  // rgb(236, 239, 180)
      { threshold: 40.0, color: '#FBE98F' },  // rgb(251, 233, 143)
      { threshold: 50.0, color: '#F6D463' },  // rgb(246, 212, 99)
      { threshold: 75.0, color: '#EEB53D' },  // rgb(238, 181, 61)
      { threshold: 100.0, color: '#E28721' }, // rgb(226, 135, 33)
      { threshold: 150.0, color: '#D15D0C' }, // rgb(209, 93, 12)
      { threshold: 200.0, color: '#AB4211' }, // rgb(171, 66, 17)
      { threshold: 500.0, color: '#862716' }, // rgb(134, 39, 22)
    ]
  },
  pm10: {
    minValue: 0.0,
    maxValue: 500.0,
    levels: [
      { threshold: 2.0, color: '#C7EAF4' },   // rgb(199, 234, 244)
      { threshold: 5.0, color: '#B4E0EC' },   // rgb(180, 224, 236)
      { threshold: 10.0, color: '#A1D6E4' },  // rgb(161, 214, 228)
      { threshold: 20.0, color: '#C0E0CE' },  // rgb(192, 224, 206)
      { threshold: 30.0, color: '#ECEFB4' },  // rgb(236, 239, 180)
      { threshold: 40.0, color: '#FBE98F' },  // rgb(251, 233, 143)
      { threshold: 50.0, color: '#F6D463' },  // rgb(246, 212, 99)
      { threshold: 75.0, color: '#EEB53D' },  // rgb(238, 181, 61)
      { threshold: 100.0, color: '#E28721' }, // rgb(226, 135, 33)
      { threshold: 150.0, color: '#D15D0C' }, // rgb(209, 93, 12)
      { threshold: 200.0, color: '#AB4211' }, // rgb(171, 66, 17)
      { threshold: 500.0, color: '#862716' }, // rgb(134, 39, 22)
    ]
  },
  no2: {
    minValue: 0.0,
    maxValue: 300.0,
    levels: [
      { threshold: 2.0, color: '#C7EAF4' },   // rgb(199, 234, 244)
      { threshold: 5.0, color: '#B4E0EC' },   // rgb(180, 224, 236)
      { threshold: 10.0, color: '#A1D6E4' },  // rgb(161, 214, 228)
      { threshold: 20.0, color: '#C0E0CE' },  // rgb(192, 224, 206)
      { threshold: 30.0, color: '#ECEFB4' },  // rgb(236, 239, 180)
      { threshold: 40.0, color: '#FBE98F' },  // rgb(251, 233, 143)
      { threshold: 50.0, color: '#F6D463' },  // rgb(246, 212, 99)
      { threshold: 75.0, color: '#EEB53D' },  // rgb(238, 181, 61)
      { threshold: 100.0, color: '#E28721' }, // rgb(226, 135, 33)
      { threshold: 150.0, color: '#D15D0C' }, // rgb(209, 93, 12)
      { threshold: 200.0, color: '#AB4211' }, // rgb(171, 66, 17)
      { threshold: 300.0, color: '#862716' }, // rgb(134, 39, 22)
    ]
  },
  o3: {
    minValue: 0.0,
    maxValue: 500.0,
    levels: [
      { threshold: 20.0, color: '#C7EAF4' },   // rgb(199, 234, 244)
      { threshold: 40.0, color: '#B4E0EC' },   // rgb(180, 224, 236)
      { threshold: 60.0, color: '#A1D6E4' },  // rgb(161, 214, 228)
      { threshold: 80.0, color: '#C0E0CE' },  // rgb(192, 224, 206)
      { threshold: 100.0, color: '#ECEFB4' },  // rgb(236, 239, 180)
      { threshold: 120.0, color: '#FBE98F' },  // rgb(251, 233, 143)
      { threshold: 140.0, color: '#F6D463' },  // rgb(246, 212, 99)
      { threshold: 160.0, color: '#EEB53D' },  // rgb(238, 181, 61)
      { threshold: 180.0, color: '#E28721' }, // rgb(226, 135, 33)
      { threshold: 200.0, color: '#D15D0C' }, // rgb(209, 93, 12)
      { threshold: 240.0, color: '#AB4211' }, // rgb(171, 66, 17)
      { threshold: 500.0, color: '#862716' }, // rgb(134, 39, 22)
    ]
  },
  so2: {
    minValue: 0.0,
    maxValue: 800.0,
    levels: [
      { threshold: 2.0, color: '#C7EAF4' },   // rgb(199, 234, 244)
      { threshold: 5.0, color: '#B4E0EC' },   // rgb(180, 224, 236)
      { threshold: 10.0, color: '#A1D6E4' },  // rgb(161, 214, 228)
      { threshold: 20.0, color: '#C0E0CE' },  // rgb(192, 224, 206)
      { threshold: 30.0, color: '#ECEFB4' },  // rgb(236, 239, 180)
      { threshold: 40.0, color: '#FBE98F' },  // rgb(251, 233, 143)
      { threshold: 50.0, color: '#F6D463' },  // rgb(246, 212, 99)
      { threshold: 75.0, color: '#EEB53D' },  // rgb(238, 181, 61)
      { threshold: 100.0, color: '#E28721' }, // rgb(226, 135, 33)
      { threshold: 150.0, color: '#D15D0C' }, // rgb(209, 93, 12)
      { threshold: 200.0, color: '#AB4211' }, // rgb(171, 66, 17)
      { threshold: 800.0, color: '#862716' }, // rgb(134, 39, 22)
    ]
  }
}

// Helper function to convert hex color to RGB array
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [0, 0, 0]
}

// Helper function to get color for a value
export function getColorForValue(value: number, pollutant: PollutantType | 'aqi'): [number, number, number] {
  const contours = pollutantContours[pollutant]
  if (!contours) return [0, 0, 0]

  for (const level of contours.levels) {
    if (value < level.threshold) {
      return hexToRgb(level.color)
    }
  }
  
  return hexToRgb(contours.levels[contours.levels.length - 1].color)
} 