import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import GlobalSummaryTable from './GlobalSummaryTable'
import {
  createComparisonData,
  createSummaryRow,
} from '../../../services/summary-comparison-service'

jest.mock('../../../services/summary-comparison-service', () => ({
  createComparisonData: jest.fn().mockReturnValue([{}]),
  createSummaryRow: jest.fn().mockReturnValue({
    locationName: 'London',
    forecast: {
      aqiLevel: 3,
      no2: { value: 0, time: '2024-03-21T12:00:00Z', aqiLevel: 1 },
      so2: { value: 1.2, time: '2024-03-22T12:00:00Z', aqiLevel: 1 },
      o3: { value: 33, time: '2024-03-23T12:00:00Z', aqiLevel: 3 },
      pm2_5: { value: 1.4, time: '2024-03-24T12:00:00Z', aqiLevel: 1 },
      pm10: { value: 1.5, time: '2024-03-25T12:00:00Z', aqiLevel: 1 },
    },
    measurements: {
      aqiLevel: 5,
      no2: { value: 2.1, aqiLevel: 1 },
      so2: { value: 2.2, aqiLevel: 1 },
      o3: { value: 53, aqiLevel: 5 },
      pm2_5: { value: 2.4, aqiLevel: 1 },
      pm10: { value: 2.5, aqiLevel: 1 },
    },
    aqiDifference: -2,
  }),
}))

const renderGrid = (showAllColoured: boolean) => {
  // The tests are driven by the mocked data returned from Create Summary Row
  return render(
    <GlobalSummaryTable
      forecast={{}}
      summarizedMeasurements={{}}
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
      render(
        <GlobalSummaryTable
          forecast={undefined}
          summarizedMeasurements={undefined}
          showAllColoured={true}
        />,
        {
          wrapper: BrowserRouter,
        },
      )

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })
    })
    it('displays message when no data is available', async () => {
      ;(createComparisonData as jest.Mock).mockReturnValueOnce([])
      renderGrid(true)
      await waitFor(() => {
        expect(screen.getByText('No Rows To Show')).toBeInTheDocument()
      })
    })
    it('displays forecast data even when measurements do not exist for a location', async () => {
      ;(createSummaryRow as jest.Mock).mockReturnValueOnce({
        locationName: 'London',
        forecast: {
          aqiLevel: 3,
          no2: { value: 0, time: '2024-03-21T12:00:00Z', aqiLevel: 1 },
          so2: { value: 1.2, time: '2024-03-22T12:00:00Z', aqiLevel: 1 },
          o3: { value: 33, time: '2024-03-23T12:00:00Z', aqiLevel: 3 },
          pm2_5: { value: 1.4, time: '2024-03-24T12:00:00Z', aqiLevel: 1 },
          pm10: { value: 1.5, time: '2024-03-25T12:00:00Z', aqiLevel: 1 },
        },
        aqiDifference: -2,
      })

      renderGrid(true)

      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument()
      })
    })
  })
  describe('when measured and forecast data exist', () => {
    it('displays all data for the SummaryRow', async () => {
      renderGrid(true)

      await waitFor(() => {
        expect(screen.getByText('London')).toBeInTheDocument()

        expect(screen.getByText('-2')).toBeInTheDocument()

        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('0')).toBeInTheDocument()
        expect(screen.getByText('1.2')).toBeInTheDocument()
        expect(screen.getByText('33')).toBeInTheDocument()
        expect(screen.getByText('1.4')).toBeInTheDocument()
        expect(screen.getByText('1.5')).toBeInTheDocument()

        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByText('2.1')).toBeInTheDocument()
        expect(screen.getByText('2.2')).toBeInTheDocument()
        expect(screen.getByText('53')).toBeInTheDocument()
        expect(screen.getByText('2.4')).toBeInTheDocument()
        expect(screen.getByText('2.5')).toBeInTheDocument()

        expect(screen.getByText('21 Mar 12:00')).toBeInTheDocument()
        expect(screen.getByText('22 Mar 12:00')).toBeInTheDocument()
        expect(screen.getByText('23 Mar 12:00')).toBeInTheDocument()
        expect(screen.getByText('24 Mar 12:00')).toBeInTheDocument()
        expect(screen.getByText('25 Mar 12:00')).toBeInTheDocument()
      })
    })
    it('when showAllColoured is true all AQI and pollutant cells are highlighted', async () => {
      renderGrid(true)

      await waitFor(() => {
        expect(screen.getByText('3')).toHaveClass('cell-medium')
        expect(screen.getByText('0')).toHaveClass('cell-very-good')
        expect(screen.getByText('1.2')).toHaveClass('cell-very-good')
        expect(screen.getByText('33')).toHaveClass('cell-medium')
        expect(screen.getByText('1.4')).toHaveClass('cell-very-good')
        expect(screen.getByText('1.5')).toHaveClass('cell-very-good')

        expect(screen.getByText('5')).toHaveClass('cell-very-poor')
        expect(screen.getByText('2.1')).toHaveClass('cell-very-good')
        expect(screen.getByText('2.2')).toHaveClass('cell-very-good')
        expect(screen.getByText('53')).toHaveClass('cell-very-poor')
        expect(screen.getByText('2.4')).toHaveClass('cell-very-good')
        expect(screen.getByText('2.5')).toHaveClass('cell-very-good')
      })
    })
    it('when showAllColoured is not true only max diff AQI and pollutant cells are highlighted', async () => {
      renderGrid(false)

      await waitFor(() => {
        expect(screen.getByText('3')).toHaveClass('cell-medium')
        expect(screen.getByText('0')).not.toHaveClass('cell-very-good')
        expect(screen.getByText('1.2')).not.toHaveClass('cell-very-good')
        expect(screen.getByText('33')).toHaveClass('cell-medium')
        expect(screen.getByText('1.4')).not.toHaveClass('cell-very-good')
        expect(screen.getByText('1.5')).not.toHaveClass('cell-very-good')

        expect(screen.getByText('5')).toHaveClass('cell-very-poor')
        expect(screen.getByText('2.1')).not.toHaveClass('cell-very-good')
        expect(screen.getByText('2.2')).not.toHaveClass('cell-very-good')
        expect(screen.getByText('53')).toHaveClass('cell-very-poor')
        expect(screen.getByText('2.4')).not.toHaveClass('cell-very-good')
        expect(screen.getByText('2.5')).not.toHaveClass('cell-very-good')
      })
    })
  })
  it('displays columns', async () => {
    renderGrid(true)
    await waitFor(() => {
      expect(screen.getByText('City')).toBeInTheDocument()
      expect(screen.getByText('AQI Level')).toBeInTheDocument()
      expect(screen.getByText('Nitrogen Dioxide (µg/m³)')).toBeInTheDocument()
      expect(screen.getByText('Ozone (µg/m³)')).toBeInTheDocument()
      expect(screen.getByText('Sulphur Dioxide (µg/m³)')).toBeInTheDocument()
      expect(screen.getByText('PM2.5 (µg/m³)')).toBeInTheDocument()
      expect(screen.getByText('PM10 (µg/m³)')).toBeInTheDocument()
    })
  })
})
