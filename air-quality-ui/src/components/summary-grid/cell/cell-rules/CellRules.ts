import colourCell, { Params } from './ColourCell'

export default function cellRules(showAllColoured: boolean) {
  return {
    pm2_5: {
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
        if (params.value) {
          return params.value > 800
        }
      },
      'empty-cell': (params: Params) =>
        params.value === undefined && showAllColoured,
    },

    pm10: {
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
        if (params.value) {
          return params.value > 1200
        }
      },
      'empty-cell': (params: Params) =>
        params.value === undefined && showAllColoured,
    },

    so2: {
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
        if (params.value) {
          return params.value > 1250
        }
      },
      'empty-cell': (params: Params) =>
        params.value === undefined && showAllColoured,
    },

    no2: {
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
        if (params.value) {
          return params.value > 1000
        }
      },
      'empty-cell': (params: Params) =>
        params.value === undefined && showAllColoured,
    },

    o3: {
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
        if (params.value) {
          return params.value > 800
        }
      },
      'empty-cell': (params: Params) =>
        params.value === undefined && showAllColoured,
    },
  }
}
