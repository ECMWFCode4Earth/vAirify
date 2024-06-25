import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import GlobalSummaryTable from './GlobalSummaryTable'
import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../../services/types'
import {
  mockForecastResponseDto,
  mockMeasurementSummaryResponseDto,
} from '../../test-util/mock-type-creator'

const forecastData = mockForecastResponseDto({
  location_name: 'London',
  valid_time: '2024-06-21T00:00:00Z',
  no2: { aqi_level: 1, value: 1 },
})
const measurementData = mockMeasurementSummaryResponseDto({
  location_name: 'London',
  measurement_base_time: '2024-06-21T00:00:00Z',
  no2: { mean: { aqi_level: 1, value: 1 } },
})

const renderGrid = (
  forecast?: ForecastResponseDto[],
  measurements?: MeasurementSummaryResponseDto[],
) => {
  return render(
    <GlobalSummaryTable
      forecast={
        forecast ? (forecast.length ? { London: forecast } : {}) : undefined
      }
      summarizedMeasurements={
        measurements
          ? measurements.length
            ? { London: measurements }
            : {}
          : undefined
      }
    />,
    {
      wrapper: BrowserRouter,
    },
  )
}

describe('GlobalSummaryTable component', () => {
  describe('renders the summary table', () => {
    it('displays message when data is loading', async () => {
      renderGrid()
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })
    })
    it('displays message when no data is available', async () => {
      renderGrid([], [])
      await waitFor(() => {
        expect(screen.getByText('No Rows To Show')).toBeInTheDocument()
      })
    })
    it('displays forecast data even when measurements do not exist for a location', async () => {
      renderGrid([forecastData], [])
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument()
      })
    })
    describe('when measured and forecast data exist', () => {
      beforeEach(() => {
        renderGrid([forecastData], [measurementData])
      })
      it('displays the locations', async () => {
        await waitFor(() => {
          expect(screen.getByText('London')).toBeInTheDocument()
        })
      })
      it('displays the mean aqi difference', async () => {
        await waitFor(() => {
          expect(screen.getByText('0')).toBeInTheDocument()
        })
      })
      it('displays rounded values', async () => {
        await waitFor(() => {
          expect(screen.getByText('5.1')).toBeInTheDocument()
        })
      })
    })
    it('displays columns', async () => {
      renderGrid()
      await waitFor(() => {
        expect(screen.getByText('City')).toBeInTheDocument()
        expect(screen.getByText('AQI Level')).toBeInTheDocument()
        expect(screen.getByText('Nitrogen Dioxide (µg/m³)')).toBeInTheDocument()
        expect(screen.getByText('Ozone (µg/m³)')).toBeInTheDocument()
        expect(screen.getByText('Sulphur Dioxide (µg/m³)')).toBeInTheDocument()
        expect(screen.getByText('PM 2.5 (µg/m³)')).toBeInTheDocument()
        expect(screen.getByText('PM 10 (µg/m³)')).toBeInTheDocument()
      })
    })
  })
})
