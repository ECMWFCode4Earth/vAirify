import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import GlobalSummaryTable from './GlobalSummaryTable'
import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../services/types'

const forecastData: ForecastResponseDto = {
  base_time: '2024-06-01T00:00:00',
  valid_date: '2024-06-01T00:00:00',
  location_type: 'city',
  location_name: 'Bristol',
  overall_aqi_level: 5,
  no2: { aqi_level: 1, value: 1 },
  so2: { aqi_level: 2, value: 2 },
  o3: { aqi_level: 3, value: 3 },
  pm10: { aqi_level: 4, value: 4 },
  pm2_5: { aqi_level: 5, value: 5.123956 },
}

const measurementData: MeasurementSummaryResponseDto = {
  measurement_base_time: '2024-06-01T00:00:00',
  location_type: 'city',
  location_name: 'Bristol',
  overall_aqi_level: { mean: 5, median: 4 },
}

const renderGrid = (
  forecast: ForecastResponseDto[],
  measurements: MeasurementSummaryResponseDto[],
) => {
  return render(
    <GlobalSummaryTable
      forecast={forecast}
      summarizedMeasurements={measurements}
    />,
    {
      wrapper: BrowserRouter,
    },
  )
}

describe('GlobalSummaryTable component', () => {
  describe('renders the summary table', () => {
    it('and displays message when no data is available', async () => {
      renderGrid([], [])
      await waitFor(() => {
        expect(screen.getByText('No Rows To Show')).toBeInTheDocument()
      })
    })
    it('and displays messages when measurements do not exist for a location', async () => {
      renderGrid([forecastData], [])
      await waitFor(() => {
        expect(screen.getByText('No Rows To Show')).toBeInTheDocument()
      })
    })
    describe('and when measured and forecast data exist', () => {
      beforeEach(() => {
        renderGrid([forecastData], [measurementData])
      })
      it('displays the locations', async () => {
        await waitFor(() => {
          expect(screen.getByText('Bristol')).toBeInTheDocument()
        })
      })
      it('displays the mean aqi difference', async () => {
        await waitFor(() => {
          // Median would be 4
          expect(screen.getByText('0')).toBeInTheDocument()
        })
      })
      it('displays rounded values', async () => {
        await waitFor(() => {
          expect(screen.getByText('5.124')).toBeInTheDocument()
        })
      })
    })
    it('and displays columns', async () => {
      renderGrid([], [])
      await waitFor(() => {
        expect(screen.getByText('City')).toBeInTheDocument()
        expect(screen.getByText('AQI Difference')).toBeInTheDocument()
        expect(screen.getByText('AQI (1-6)')).toBeInTheDocument()
        expect(screen.getByText('Nitrogen Dioxide (µg/m³)')).toBeInTheDocument()
        expect(screen.getByText('Ozone (µg/m³)')).toBeInTheDocument()
        expect(screen.getByText('Sulphur Dioxide (µg/m³)')).toBeInTheDocument()
        expect(screen.getByText('PM 2.5 (µg/m³)')).toBeInTheDocument()
        expect(screen.getByText('PM 10 (µg/m³)')).toBeInTheDocument()
      })
    })
  })
})
