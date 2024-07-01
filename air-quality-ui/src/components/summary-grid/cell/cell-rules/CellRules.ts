import colourCell, { Params } from './ColourCell'

export default function cellRules(showAllColoured: boolean) {
  return {
    pm2_5: {
      'cell-very-good': (params: Params) =>
        colourCell(showAllColoured, params, 0, 10),
      'cell-good': (params: Params) =>
        colourCell(showAllColoured, params, 10, 20),
      'cell-medium': (params: Params) =>
        colourCell(showAllColoured, params, 20, 25),
      'cell-poor': (params: Params) =>
        colourCell(showAllColoured, params, 25, 50),
      'cell-very-poor': (params: Params) =>
        colourCell(showAllColoured, params, 50, 75),
      'cell-extremely-poor': (params: Params) =>
        colourCell(showAllColoured, params, 75, 800),
      'cell-error': (params: Params) =>
        colourCell(showAllColoured, params, 800),
      'empty-cell': (params: Params) =>
        params.value === undefined && showAllColoured,
    },

    pm10: {
      'cell-very-good': (params: Params) =>
        colourCell(showAllColoured, params, 0, 20),
      'cell-good': (params: Params) =>
        colourCell(showAllColoured, params, 20, 40),
      'cell-medium': (params: Params) =>
        colourCell(showAllColoured, params, 40, 50),
      'cell-poor': (params: Params) =>
        colourCell(showAllColoured, params, 50, 100),
      'cell-very-poor': (params: Params) =>
        colourCell(showAllColoured, params, 100, 150),
      'cell-extremely-poor': (params: Params) =>
        colourCell(showAllColoured, params, 150, 1200),
      'cell-error': (params: Params) =>
        colourCell(showAllColoured, params, 1200),
      'empty-cell': (params: Params) =>
        params.value === undefined && showAllColoured,
    },

    so2: {
      'cell-very-good': (params: Params) =>
        colourCell(showAllColoured, params, 0, 100),
      'cell-good': (params: Params) =>
        colourCell(showAllColoured, params, 100, 200),
      'cell-medium': (params: Params) =>
        colourCell(showAllColoured, params, 200, 350),
      'cell-poor': (params: Params) =>
        colourCell(showAllColoured, params, 350, 500),
      'cell-very-poor': (params: Params) =>
        colourCell(showAllColoured, params, 500, 750),
      'cell-extremely-poor': (params: Params) =>
        colourCell(showAllColoured, params, 750, 1250),
      'cell-error': (params: Params) =>
        colourCell(showAllColoured, params, 1250),
      'empty-cell': (params: Params) =>
        params.value === undefined && showAllColoured,
    },

    no2: {
      'cell-very-good': (params: Params) =>
        colourCell(showAllColoured, params, 0, 40),
      'cell-good': (params: Params) =>
        colourCell(showAllColoured, params, 40, 90),
      'cell-medium': (params: Params) =>
        colourCell(showAllColoured, params, 90, 120),
      'cell-poor': (params: Params) =>
        colourCell(showAllColoured, params, 120, 230),
      'cell-very-poor': (params: Params) =>
        colourCell(showAllColoured, params, 230, 340),
      'cell-extremely-poor': (params: Params) =>
        colourCell(showAllColoured, params, 340, 1000),
      'cell-error': (params: Params) =>
        colourCell(showAllColoured, params, 1000),
      'empty-cell': (params: Params) =>
        params.value === undefined && showAllColoured,
    },

    o3: {
      'cell-very-good': (params: Params) =>
        colourCell(showAllColoured, params, 0, 50),
      'cell-good': (params: Params) =>
        colourCell(showAllColoured, params, 50, 100),
      'cell-medium': (params: Params) =>
        colourCell(showAllColoured, params, 100, 130),
      'cell-poor': (params: Params) =>
        colourCell(showAllColoured, params, 130, 240),
      'cell-very-poor': (params: Params) =>
        colourCell(showAllColoured, params, 240, 380),
      'cell-extremely-poor': (params: Params) =>
        colourCell(showAllColoured, params, 380, 800),
      'cell-error': (params: Params) =>
        colourCell(showAllColoured, params, 800),
      'empty-cell': (params: Params) =>
        params.value === undefined && showAllColoured,
    },
  }
}
