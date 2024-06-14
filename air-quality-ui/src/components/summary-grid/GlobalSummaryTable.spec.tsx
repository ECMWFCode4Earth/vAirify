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

const forecastData = mockForecastResponseDto()
const measurementData = mockMeasurementSummaryResponseDto({
  no2: { mean: { aqi_level: 5, value: 1 }, median: { aqi_level: 5, value: 1 } },
})

const renderGrid = (
  forecast?: ForecastResponseDto[],
  measurements?: MeasurementSummaryResponseDto[],
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
    it('and displays message when data is loading', async () => {
      renderGrid(undefined, undefined)
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })
    })
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
