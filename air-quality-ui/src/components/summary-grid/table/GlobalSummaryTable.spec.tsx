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
  so2: { aqi_level: 1, value: 1.7 },
})
const measurementDataOne = mockMeasurementSummaryResponseDto({
  location_name: 'London',
  measurement_base_time: '2024-06-25T00:00:00Z',
  location_type: 'city',
  overall_aqi_level: { mean: 1 },
  so2: { mean: { aqi_level: 1, value: 1.2 } },
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

const forecastDataFour = mockForecastResponseDto({
  location_name: 'Seoul',
  base_time: '2024-06-19T00:00:00Z',
  valid_time: '2024-06-19T00:00:00Z',
  overall_aqi_level: 1,
  no2: { aqi_level: 1, value: 1.1 },
  so2: { aqi_level: 1, value: 1.2 },
  pm2_5: { aqi_level: 1, value: 1.3 },
  pm10: { aqi_level: 1, value: 1.4 },
  o3: { aqi_level: 1, value: 1.5 },
})

const measurementDataFour = mockMeasurementSummaryResponseDto({
  location_name: 'Seoul',
  measurement_base_time: '2024-06-19T00:00:00Z',
  location_type: 'city',
  overall_aqi_level: { mean: 6 },
  no2: { mean: { aqi_level: 6, value: 600 } },
  so2: { mean: { aqi_level: 1, value: 3.6 } },
})

const forecastDataUniqueAqiText = mockForecastResponseDto({
  location_name: 'Seoul',
  base_time: '2024-07-09T00:00:00Z',
  valid_time: '2024-07-09T00:00:00Z',
  overall_aqi_level: 5,
  no2: { aqi_level: 5, value: 222 },
})

const measurementDataUniqueAqiText = mockMeasurementSummaryResponseDto({
  location_name: 'Seoul',
  measurement_base_time: '2024-07-09T00:00:00Z',
  location_type: 'city',
  overall_aqi_level: { mean: 6 },
  no2: { mean: { aqi_level: 6, value: 777 } },
})

const renderGrid = (
  forecast: Record<string, ForecastResponseDto[]> | undefined,
  measurements: Record<string, MeasurementSummaryResponseDto[]> | undefined,
  showAllColoured: boolean,
) => {
  return render(
    <GlobalSummaryTable
      forecast={forecast}
      summarizedMeasurements={measurements}
      showAllColoured={showAllColoured}
    />,
    {
      wrapper: BrowserRouter,
    },
  )
}

describe('GlobalSummaryTable component', () => {
  describe('renders the summary table', () => {
    it('displays message when data is loading', async () => {
      renderGrid(undefined, undefined, true)
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })
    })
    it('displays message when no data is available', async () => {
      renderGrid({}, {}, true)
      await waitFor(() => {
        expect(screen.getByText('No Rows To Show')).toBeInTheDocument()
      })
    })
    it('displays forecast data even when measurements do not exist for a location', async () => {
      renderGrid({ London: [forecastDataOne] }, { London: [] }, true)
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument()
      })
    })
  })
  describe('when measured and forecast data exist', () => {
    it('displays the locations', async () => {
      renderGrid(
        {
          London: [forecastDataOne],
          Dakar: [forecastDataTwo],
          Baku: [forecastDataThree],
        },
        {
          London: [measurementDataOne],
          Dakar: [measurementDataTwo],
          Baku: [measurementDataThree],
        },
        true,
      )
      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument()
      })
    })
    it('displays the mean aqi difference', async () => {
      renderGrid(
        { London: [forecastDataOne] },
        { London: [measurementDataOne] },
        true,
      )
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
      })
    })
    it('displays + infront of the mean aqi difference if forecast aqi is greater than measurement aqi', async () => {
      renderGrid(
        { Dakar: [forecastDataTwo] },
        { Dakar: [measurementDataTwo] },
        true,
      )
      await waitFor(() => {
        expect(screen.getByText('+5')).toBeInTheDocument()
      })
    })
    it('displays - infront of the mean aqi difference if forecast aqi is smaller than measurement aqi', async () => {
      renderGrid(
        { Baku: [forecastDataThree] },
        { Baku: [measurementDataThree] },
        true,
      )
      await waitFor(() => {
        expect(screen.getByText('-5')).toBeInTheDocument()
      })
    })
    it('displays rounded values', async () => {
      renderGrid(
        { London: [forecastDataOne] },
        { London: [measurementDataOne] },
        true,
      )
      await waitFor(() => {
        expect(screen.getByText('5.1')).toBeInTheDocument()
      })
    })
    it('when showAllColoured is true cell should be highlighted', async () => {
      renderGrid(
        { Seoul: [forecastDataFour] },
        { Seoul: [measurementDataFour] },
        true,
      )
      await waitFor(() => {
        expect(screen.getByText('3.6')).toHaveClass('cell-very-good')
      })
    })
    it('when showAllColoured is false cell should not be highlighted', async () => {
      renderGrid(
        { Seoul: [forecastDataFour] },
        { Seoul: [measurementDataFour] },
        false,
      )
      await waitFor(() => {
        expect(screen.getByText('3.6')).not.toHaveClass('cell-very-good')
      })
    })
    it('forecast and measured AQI are displayed and highlighted', async () => {
      renderGrid(
        { Seoul: [forecastDataUniqueAqiText] },
        { Seoul: [measurementDataUniqueAqiText] },
        false,
      )
      await waitFor(() => {
        expect(screen.getByText('5')).toHaveClass('cell-very-poor')
      })
      await waitFor(() => {
        expect(screen.getByText('6')).toHaveClass('cell-extremely-poor')
      })
    })
  })
  it('displays columns', async () => {
    renderGrid(undefined, undefined, true)
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
