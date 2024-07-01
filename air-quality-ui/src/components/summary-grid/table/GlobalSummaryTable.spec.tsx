import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import GlobalSummaryTable from './GlobalSummaryTable'
import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../../../services/types'
import {
  mockForecastResponseDto,
  mockMeasurementSummaryResponseDto,
} from '../../../test-util/mock-type-creator'

const forecastDataOne = mockForecastResponseDto({
  location_name: 'London',
  valid_time: '2024-06-25T00:00:00Z',
  base_time: '2024-06-25T00:00:00Z',
  overall_aqi_level: 1,
  so2: { aqi_level: 1, value: 1 },
})
const measurementDataOne = mockMeasurementSummaryResponseDto({
  location_name: 'London',
  measurement_base_time: '2024-06-25T00:00:00Z',
  location_type: 'city',
  overall_aqi_level: { mean: 1 },
  so2: { mean: { aqi_level: 1, value: 1 } },
})

const forecastDataTwo = mockForecastResponseDto({
  location_name: 'Dakar',
  base_time: '2024-06-22T00:00:00Z',
  valid_time: '2024-06-22T00:00:00Z',
  overall_aqi_level: 6,
  no2: { aqi_level: 6, value: 600 },
})

const measurementDataTwo = mockMeasurementSummaryResponseDto({
  location_name: 'Dakar',
  measurement_base_time: '2024-06-22T00:00:00Z',
  location_type: 'city',
  overall_aqi_level: { mean: 1 },
  no2: { mean: { aqi_level: 1, value: 1 } },
})

const forecastDataThree = mockForecastResponseDto({
  location_name: 'Baku',
  base_time: '2024-06-19T00:00:00Z',
  valid_time: '2024-06-19T00:00:00Z',
  overall_aqi_level: 1,
  no2: { aqi_level: 1, value: 1 },
})

const measurementDataThree = mockMeasurementSummaryResponseDto({
  location_name: 'Baku',
  measurement_base_time: '2024-06-19T00:00:00Z',
  location_type: 'city',
  overall_aqi_level: { mean: 6 },
  no2: { mean: { aqi_level: 6, value: 600 } },
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
      showAllColoured={false}
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
      renderGrid([forecastDataOne], [])
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument()
      })
    })
  })
  describe('when measured and forecast data exist', () => {
    it('displays the locations', async () => {
      renderGrid(
        [forecastDataOne, forecastDataTwo, forecastDataThree],
        [measurementDataOne, measurementDataTwo, measurementDataThree],
      )
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument()
      })
    })
    it('displays the mean aqi difference', async () => {
      renderGrid([forecastDataOne], [measurementDataOne])
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
      })
    })
    it('displays + infront of the mean aqi difference if forecast aqi is greater than measurement aqi', async () => {
      renderGrid([forecastDataTwo], [measurementDataTwo])
      await waitFor(() => {
        expect(screen.getByText('+5')).toBeInTheDocument()
      })
    })
    it('displays - infront of the mean aqi difference if forecast aqi is smaller than measurement aqi', async () => {
      renderGrid([forecastDataThree], [measurementDataThree])
      await waitFor(() => {
        expect(screen.getByText('-5')).toBeInTheDocument()
      })
    })
    it('displays rounded values', async () => {
      renderGrid([forecastDataOne], [measurementDataOne])
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
