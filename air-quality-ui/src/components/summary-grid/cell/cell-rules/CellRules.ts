import colourCell, { Params } from './ColourCell'
import { PollutantType } from '../../../../models'

export const pollutantCellRules = (
  showAllColoured: boolean,
  pollutantType: PollutantType | null = null,
) => {
  const errorLimit = {
    pm2_5: 800,
    pm10: 1200,
    so2: 1250,
    no2: 1000,
    o3: 800,
  }

  return {
    'cell-very-good': (params: Params) =>
      colourCell(showAllColoured, params, 1),
    'cell-good': (params: Params) => colourCell(showAllColoured, params, 2),
    'cell-medium': (params: Params) => colourCell(showAllColoured, params, 3),
    'cell-poor': (params: Params) => colourCell(showAllColoured, params, 4),
    'cell-very-poor': (params: Params) =>
      colourCell(showAllColoured, params, 5),
    'cell-extremely-poor': (params: Params) =>
      colourCell(showAllColoured, params, 6),
    'cell-error': (params: Params) => {
      if (params.value && pollutantType) {
        return params.value > errorLimit[pollutantType]
      }
      return false
    },
    'empty-cell': (params: Params) =>
      params.value === undefined && showAllColoured,
  }
}

export const aqiCellRules = () => {
  return {
    'cell-very-good': (params: { value: number }) => params.value === 1,
    'cell-good': (params: { value: number }) => params.value === 2,
    'cell-medium': (params: { value: number }) => params.value === 3,
    'cell-poor': (params: { value: number }) => params.value === 4,
    'cell-very-poor': (params: { value: number }) => params.value === 5,
    'cell-extremely-poor': (params: { value: number }) => params.value === 6,
    'cell-error': (params: { value: number }) => {
      if (params.value) {
        return params.value > 6
      }
      return false
    },
    'empty-cell': (params: { value: number }) => params.value === undefined,
  }
}
