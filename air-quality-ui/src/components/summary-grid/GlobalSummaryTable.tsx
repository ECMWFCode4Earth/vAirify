import { ColDef, ColGroupDef, GridOptions } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import './GlobalSummaryTable.module.css'
import { useMemo } from 'react'

import { LocationCellRenderer } from './LocationCellRenderer'
import {
  PollutantType,
  pollutantTypeDisplay,
  pollutantTypes,
} from '../../models'
import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../../services/types'

type SummaryDetail = {
  aqiLevel: number
} & { [P in PollutantType]?: number }

interface SummaryRow {
  locationName: string
  forecast: SummaryDetail
  measurements: SummaryDetail
  aqiDifference: number
}

interface GlobalSummaryTableProps {
  forecast: ForecastResponseDto[]
  summarizedMeasurements: MeasurementSummaryResponseDto[]
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
    headerName: 'AQI (1-6)',
    children: [
      { field: 'forecast.aqiLevel', headerName: 'Forecast' },
      { field: 'measurements.aqiLevel', headerName: 'Measured' },
      { field: 'aqiDifference', headerName: 'Diff' },
    ],
  },
  ...pollutantTypes.flatMap((type) => ({
    headerName: `${pollutantTypeDisplay[type]} (µg/m³)`,
    children: [
      { field: `forecast.${type}`, headerName: `Forecast` },
      { field: `measurements.${type}`, headerName: `Measured` },
    ],
  })),
]

const createGridOptions = (): GridOptions => ({
  autoSizeStrategy: {
    type: 'fitCellContents',
  },
})

const mapApiRow = (
  forecastData: ForecastResponseDto,
  measurementData: MeasurementSummaryResponseDto,
): SummaryRow => {
  const location = forecastData.location_name
  const row: SummaryRow = {
    locationName: location,
    forecast: {
      aqiLevel: forecastData.overall_aqi_level,
    },
    measurements: {
      aqiLevel: measurementData.overall_aqi_level.mean,
    },
    aqiDifference: Math.abs(
      forecastData.overall_aqi_level - measurementData.overall_aqi_level.mean,
    ),
  }
  pollutantTypes.forEach((type) => {
    row.forecast[type] = parseFloat(forecastData[type].value.toFixed(3))
    const mean = measurementData[type]?.mean.value
    row.measurements[type] = mean ? parseFloat(mean.toFixed(3)) : undefined
  })
  return row
}

const mapApiResponse = ({
  forecast,
  summarizedMeasurements,
}: GlobalSummaryTableProps): SummaryRow[] => {
  const measurements = summarizedMeasurements.reduce<
    Record<string, MeasurementSummaryResponseDto>
  >((acc, result) => {
    const location = result.location_name
    acc[location] = result
    return acc
  }, {})
  return forecast.flatMap((forecastData) => {
    const measurement = measurements?.[forecastData.location_name]
    if (measurement) {
      return mapApiRow(forecastData, measurement)
    }
    return []
  })
}

const GlobalSummaryTable = (
  props: Partial<GlobalSummaryTableProps>,
): JSX.Element => {
  const colDefs = useMemo(() => createColDefs(), [])
  const data = useMemo(() => {
    if (props.forecast && props.summarizedMeasurements) {
      return mapApiResponse({
        forecast: props.forecast,
        summarizedMeasurements: props.summarizedMeasurements,
      })
    }
    return null
  }, [props.forecast, props.summarizedMeasurements])
  const gridOptions = createGridOptions()

  return (
    <div
      className="ag-theme-quartz"
      style={{ height: 500 }}
      data-testid="summary-grid"
    >
      <AgGridReact
        rowData={data}
        columnDefs={colDefs}
        gridOptions={gridOptions}
      />
    </div>
  )
}

export default GlobalSummaryTable
