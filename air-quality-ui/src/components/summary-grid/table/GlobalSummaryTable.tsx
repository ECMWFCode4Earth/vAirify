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
  forecast: Record<string, ForecastResponseDto[]> | undefined
  summarizedMeasurements: Record<string, MeasurementSummaryResponseDto> | undefined
  showAllColoured: boolean
  onCityHover: (cityName: string | null, latitude?: number, longitude?: number, columnId?: string) => void
}

const maxWidth = 115
const forecastWidth = 85
const measurementWidth = 85
const diffWidth = 60

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
        maxWidth: forecastWidth,
        cellClass: 'cell-format',
        cellClassRules: aqiCellRules(),
        valueFormatter: (params: ValueFormatterParams) =>
          insertEmptyValueDash(params.value),
      },
      {
        field: 'measurements.aqiLevel',
        headerName: 'Measured',
        headerClass: 'cell-header-format',
        maxWidth: measurementWidth,
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
        maxWidth: diffWidth,
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
        maxWidth: forecastWidth,
        valueFormatter: (params: ValueFormatterParams) =>
          insertEmptyValueDash(params.value),
      },
      {
        field: `measurements.${type}.value`,
        headerName: `Measured`,
        headerClass: 'cell-header-format',
        cellClass: 'cell-format',
        cellClassRules: pollutantCellRules(showAllColoured, type),
        maxWidth: measurementWidth,
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

const createGridOptions = (
  forecast: Record<string, ForecastResponseDto[]> | undefined,
  onCityHover?: (cityName: string | null, latitude?: number, longitude?: number, columnId?: string) => void
): GridOptions => ({
  autoSizeStrategy: {
    type: 'fitCellContents',
  },
  onCellMouseOver: (event) => {
    const cityName = event.data.locationName
    const columnId = event.column?.getColId()
    
    // Extract pollutant name from columnId, including aqiLevel
    const pollutantMatch = columnId?.match(/(?:forecast|measurements)\.(pm2_5|pm10|o3|no2|so2|aqiLevel)/)
    const pollutantName = pollutantMatch ? pollutantMatch[1] : 'aqiLevel'
    
    if (cityName && forecast?.[cityName]?.[0]) {
      const { latitude, longitude } = forecast[cityName][0].location
      onCityHover?.(cityName, latitude, longitude, columnId ? pollutantName : 'aqiLevel')
    } else {
      onCityHover?.(cityName, undefined, undefined, columnId ? pollutantName : 'aqiLevel')
    }
  },
  onCellMouseOut: () => {
    onCityHover?.(null)
  },
})

const GlobalSummaryTable = ({
  forecast,
  summarizedMeasurements,
  showAllColoured,
  onCityHover,
}: GlobalSummaryTableProps): JSX.Element => {
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
  const gridOptions = useMemo(
    () => createGridOptions(forecast, onCityHover),
    [forecast, onCityHover]
  )
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
