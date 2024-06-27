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
import './GridCss.css'

import cellRules from './CellRules'
import classes from './GlobalSummaryTable.module.css'
import { LocationCellRenderer } from './LocationCellRenderer'
import {
  PollutantType,
  pollutantTypeDisplay,
  pollutantTypes,
} from '../../models'
import {
  ForecastMeasurementComparison,
  createComparisonData,
} from '../../services/summary-comparison-service'
import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../../services/types'

type SummaryDetail = {
  aqiLevel?: number
} & {
  [P in PollutantType]?: { value: number; time?: string; aqiLevel: number }
}

interface SummaryRow {
  locationName: string
  forecast: SummaryDetail
  measurements?: SummaryDetail
  aqiDifference?: number
}

interface GlobalSummaryTableProps {
  forecast: Record<string, ForecastResponseDto[]>
  summarizedMeasurements: Record<string, MeasurementSummaryResponseDto[]>
  showAllColoured: boolean
}

const maxWidth = 115

function getPerformanceSymbol(
  forecastAQILevel: number,
  measurementsAQILevel: number,
) {
  if (forecastAQILevel > measurementsAQILevel) return '+'
  else if (forecastAQILevel === measurementsAQILevel) return ''
  else return '-'
}
function insertEmptyValueDash(value: number | undefined): string {
  if (value === undefined) return '-'
  return value.toString()
}
const createColDefs = (showAllColoured: boolean): (ColDef | ColGroupDef)[] => [
  {
    field: 'locationName',
    headerName: 'City',
    headerClass: 'cell-header-format',
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
        valueFormatter: (params: ValueFormatterParams) =>
          insertEmptyValueDash(params.value),
      },
      {
        field: 'measurements.aqiLevel',
        headerName: 'Measured',
        headerClass: 'cell-header-format',
        maxWidth: maxWidth,
        cellClass: 'cell-format',
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
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.data.measurements) {
            return `${getPerformanceSymbol(
              params.data.forecast.aqiLevel,
              params.data.measurements.aqiLevel,
            )}${params.data.aqiDifference}`
          }
          return '-'
        },
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
        cellClassRules: cellRules(showAllColoured)[type],
        maxWidth: maxWidth,
        valueFormatter: (params: ValueFormatterParams) =>
          insertEmptyValueDash(params.value),
      },
      {
        field: `measurements.${type}.value`,
        headerName: `Measured`,
        headerClass: 'cell-header-format',
        cellClass: 'cell-format',
        cellClassRules: cellRules(showAllColoured)[type],
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

const createSummaryRow = ({
  locationName,
  ...data
}: ForecastMeasurementComparison): SummaryRow => {
  const row: SummaryRow = {
    locationName,
    forecast: {
      aqiLevel: data.forecastOverallAqi,
    },
  }

  pollutantTypes.forEach((pollutantType) => {
    const { forecastData, measurementData } = data[pollutantType]
    row.forecast[pollutantType] = {
      value: parseFloat(forecastData.value.toFixed(1)),
      aqiLevel: forecastData.aqiLevel,
      time: forecastData.validTime,
    }
    if (measurementData) {
      row.measurements = {
        ...row.measurements,
        [pollutantType]: {
          value: parseFloat(measurementData.value.toFixed(1)),
          aqiLevel: measurementData.aqiLevel,
        },
      }
      const currentDifference = Math.abs(
        measurementData.aqiLevel - forecastData.aqiLevel,
      )
      if (!row.aqiDifference || currentDifference > row.aqiDifference) {
        row.aqiDifference = currentDifference
        row.forecast.aqiLevel = forecastData.aqiLevel
        row.measurements.aqiLevel = measurementData.aqiLevel
      }
    }
  })

  return row
}

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
