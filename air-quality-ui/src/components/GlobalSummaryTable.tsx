import { ColDef, ColGroupDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import './GlobalSummaryTable.module.css'
import { useState } from 'react'

import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../api/types'
import { PollutantType, pollutantTypes } from '../models'

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
}: GlobalSummaryTableProps) => {
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

const GlobalSummaryTable = (props: GlobalSummaryTableProps): JSX.Element => {
  const [data] = useState<SummaryRow[]>(mapApiResponse(props))

  const [colDefs] = useState<(ColDef | ColGroupDef)[]>([
    { field: 'locationName', headerName: 'City', pinned: true, filter: true },
    {
      field: 'aqiDifference',
      headerName: 'AQI Difference',
      sort: 'desc',
    },
    {
      headerName: 'AQI',
      children: [
        { field: 'forecast.aqiLevel', headerName: 'Forecast' },
        { field: 'measurements.aqiLevel', headerName: 'Measured' },
      ],
    },
    ...pollutantTypes.flatMap((type) => ({
      headerName: type,
      children: [
        { field: `forecast.${type}`, headerName: `Forecast` },
        { field: `measurements.${type}`, headerName: `Measured` },
      ],
    })),
  ])

  return (
    <div className="ag-theme-quartz" style={{ height: 500 }}>
      <AgGridReact rowData={data} columnDefs={colDefs} />
    </div>
  )
}

export default GlobalSummaryTable
