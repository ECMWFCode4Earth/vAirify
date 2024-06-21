import {
  ColDef,
  ColGroupDef,
  GridOptions,
  ValueFormatterParams,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { useMemo } from 'react'

import './GridCss.css'
import { cellRules } from './CellRules'
import classes from './GlobalSummaryTable.module.css'
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
} & {
  [P in PollutantType]?: {
    aqiLevel: number
    value: number
  }
}

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
    headerName: 'AQI Level',
    children: [
      { field: 'forecast.aqiLevel', headerName: 'Forecast' },
      { field: 'measurements.aqiLevel', headerName: 'Measured' },
      {
        field: 'aqiDifference',
        headerName: 'Diff',
        sort: 'desc',
        valueFormatter: (params: ValueFormatterParams) => {
          return `${getPerformanceSymbol(
            params.data.forecast.aqiLevel,
            params.data.measurements.aqiLevel,
          )}${params.data.aqiDifference}`
        },
      },
    ],
  },
  ...pollutantTypes.flatMap((type) => ({
    headerName: `${pollutantTypeDisplay[type]} (µg/m³)`,
    children: [
      {
        field: `forecast.${type}.value`,
        headerName: `Forecast`,
        cellClassRules: cellRules[type],
      },
      {
        field: `measurements.${type}.value`,
        headerName: `Measured`,
        cellClassRules: cellRules[type],
      },
    ],
  })),
]

const createGridOptions = (): GridOptions => ({
  autoSizeStrategy: {
    type: 'fitCellContents',
  },
})
function getPerformanceSymbol(
  forecastAqiLevel: number,
  measurementAqiLevel: number,
): string {
  if (forecastAqiLevel > measurementAqiLevel) {
    return '+'
  } else if (forecastAqiLevel === measurementAqiLevel) {
    return ''
  }
  return '-'
}
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
    row.forecast[type] = {
      value: parseFloat(forecastData[type].value.toFixed(1)),
      aqiLevel: forecastData[type]?.aqi_level ?? 0,
    }
    const mean = measurementData[type]?.mean
    if (mean) {
      row.measurements[type] = {
        value: parseFloat(mean.value.toFixed(1)),
        aqiLevel: mean.aqi_level,
      }
    }
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
      className={`ag-theme-quartz ${classes['summary-grid-wrapper']} `}
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
