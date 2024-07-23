import {
  ColDef,
  ColGroupDef,
  GridOptions,
  ValueFormatterParams,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { DateTime } from 'luxon'
import { useMemo } from 'react'
import '../cell/cell-rules/GridRules.css'

import classes from './GlobalSummaryTable.module.css'
import sortAQIComparator from './sorting/SortingAQIComparator'
import { pollutantTypeDisplay, pollutantTypes } from '../../../models'
import {
  createComparisonData,
  createSummaryRow,
} from '../../../services/summary-comparison-service'
import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../../../services/types'
import { aqiCellRules, pollutantCellRules } from '../cell/cell-rules/CellRules'
import { LocationCellRenderer } from '../cell/location-cell-renderer/LocationCellRenderer'

export interface GlobalSummaryTableProps {
  forecast: Record<string, ForecastResponseDto[]>
  summarizedMeasurements: Record<string, MeasurementSummaryResponseDto[]>
  showAllColoured: boolean
}

const maxWidth = 115

function insertEmptyValueDash(value: number | undefined): string {
  if (value === undefined) {
    return '-'
  }
  return value.toString()
}
const createColDefs = (showAllColoured: boolean): (ColDef | ColGroupDef)[] => [
  {
    field: 'locationName',
    headerName: 'City',
    headerClass: [
      'cell-header-format',
      'filterable-cell-header-format',
      'suppress-separator-header-format',
    ],
    cellClass: 'cell-format',
    pinned: true,
    filter: true,
    cellRenderer: LocationCellRenderer,
  },
  {
    headerName: 'AQI Level',
    headerClass: 'cell-header-format',
    children: [
      {
        field: 'forecast.aqiLevel',
        headerName: 'Forecast',
        headerClass: 'cell-header-format',
        maxWidth: maxWidth,
        cellClass: 'cell-format',
        cellClassRules: aqiCellRules(),
        valueFormatter: (params: ValueFormatterParams) =>
          insertEmptyValueDash(params.value),
      },
      {
        field: 'measurements.aqiLevel',
        headerName: 'Measured',
        headerClass: 'cell-header-format',
        maxWidth: maxWidth,
        cellClass: 'cell-format',
        cellClassRules: aqiCellRules(),
        valueFormatter: (params: ValueFormatterParams) =>
          insertEmptyValueDash(params.value),
      },
      {
        field: 'aqiDifference',
        headerName: 'Diff',
        headerClass: 'cell-header-format',
        sort: 'desc',
        maxWidth: maxWidth,
        cellClass: 'cell-format',
        valueFormatter: (params: ValueFormatterParams): string => {
          if (!params.data.measurements) {
            return '-'
          }
          return params.data.aqiDifference
        },
        comparator: sortAQIComparator,
      },
    ],
  },
  ...pollutantTypes.flatMap((type) => ({
    headerName: `${pollutantTypeDisplay[type]} (µg/m³)`,
    headerClass: 'cell-header-format',
    children: [
      {
        field: `forecast.${type}.value`,
        headerName: `Forecast`,
        headerClass: 'cell-header-format',
        cellClass: 'cell-format',
        cellClassRules: pollutantCellRules(showAllColoured, type),
        maxWidth: maxWidth,
        valueFormatter: (params: ValueFormatterParams) =>
          insertEmptyValueDash(params.value),
      },
      {
        field: `measurements.${type}.value`,
        headerName: `Measured`,
        headerClass: 'cell-header-format',
        cellClass: 'cell-format',
        cellClassRules: pollutantCellRules(showAllColoured, type),
        maxWidth: maxWidth,
        valueFormatter: (params: ValueFormatterParams) =>
          insertEmptyValueDash(params.value),
      },
      {
        field: `forecast.${type}.time`,
        headerName: `Time`,
        headerClass: 'cell-header-format',
        maxWidth: maxWidth,
        cellClass: 'cell-format',
        valueFormatter: (params: ValueFormatterParams) =>
          DateTime.fromISO(params.data.forecast[type].time, {
            zone: 'utc',
          }).toFormat('dd MMM HH:mm'),
      },
    ],
  })),
]

const createGridOptions = (): GridOptions => ({
  autoSizeStrategy: {
    type: 'fitCellContents',
  },
})

const GlobalSummaryTable = ({
  forecast,
  summarizedMeasurements,
  showAllColoured,
}: Partial<GlobalSummaryTableProps>): JSX.Element => {
  const rowData = useMemo(() => {
    if (!forecast || !summarizedMeasurements) {
      return null
    }
    return createComparisonData(forecast, summarizedMeasurements).map(
      (comparisonData) => createSummaryRow(comparisonData),
    )
  }, [forecast, summarizedMeasurements])

  let columnDefs
  if (showAllColoured != undefined) {
    columnDefs = createColDefs(showAllColoured)
  }
  const gridOptions = createGridOptions()
  return (
    <div
      className={`ag-theme-quartz ${classes['summary-grid-wrapper']}`}
      data-testid="summary-grid"
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        gridOptions={gridOptions}
      />
    </div>
  )
}

export default GlobalSummaryTable
