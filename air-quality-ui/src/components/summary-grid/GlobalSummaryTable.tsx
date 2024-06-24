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
} & { [P in PollutantType]?: { value: number; time?: string } }

interface SummaryRow {
  locationName: string
  forecast: SummaryDetail
  measurements?: SummaryDetail
  aqiDifference?: number
}

interface GlobalSummaryTableProps {
  forecast: Record<string, ForecastResponseDto[]>
  summarizedMeasurements: Record<string, MeasurementSummaryResponseDto[]>
}

const createColDefs = (): (ColDef | ColGroupDef)[] => [
  {
    field: 'locationName',
    headerName: 'City',
    pinned: true,
    filter: true,
    cellRenderer: LocationCellRenderer,
  },
  {
    headerName: 'AQI Level',
    children: [
      { field: 'forecast.aqiLevel', headerName: 'Forecast' },
      { field: 'measurements.aqiLevel', headerName: 'Measured' },
      {
        field: 'aqiDifference',
        headerName: 'Diff',
        sort: 'desc',
      },
    ],
  },
  ...pollutantTypes.flatMap((type) => ({
    headerName: `${pollutantTypeDisplay[type]} (µg/m³)`,
    children: [
      {
        field: `forecast.${type}.value`,
        headerName: `Forecast`,
        width: 120,
      },
      {
        field: `measurements.${type}.value`,
        headerName: `Measured`,
        width: 120,
      },
      {
        field: `forecast.${type}.time`,
        headerName: `Time`,
        width: 130,
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
      time: forecastData.validTime,
    }
    if (measurementData) {
      row.measurements = {
        ...row.measurements,
        [pollutantType]: {
          value: parseFloat(measurementData.value.toFixed(1)),
        },
      }
      const currentDifference = measurementData.aqiLevel - forecastData.aqiLevel
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
}: Partial<GlobalSummaryTableProps>): JSX.Element => {
  const rowData = useMemo(() => {
    if (!forecast || !summarizedMeasurements) {
      return null
    }
    return createComparisonData(forecast, summarizedMeasurements).map(
      (comparisonData) => createSummaryRow(comparisonData),
    )
  }, [forecast, summarizedMeasurements])

  return (
    <div
      className={`ag-theme-quartz ${classes['summary-grid-wrapper']}`}
      data-testid="summary-grid"
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={createColDefs()}
        gridOptions={createGridOptions()}
      />
    </div>
  )
}

export default GlobalSummaryTable
