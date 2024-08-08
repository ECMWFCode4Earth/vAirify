import '@testing-library/jest-dom'
import { useQueries } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import { SingleCity } from './SingleCity'
import { pollutantTypes } from '../../models'
import { mockMeasurementResponseDto } from '../../test-util/mock-type-creator'

jest.mock('@tanstack/react-query', () => ({
  useQueries: jest.fn().mockReturnValue([
    { data: [], isPending: false, isError: false },
    { data: [], isPending: false, isError: false },
  ]),
}))

jest.mock('../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.now(),
    maxInSituDate: DateTime.now(),
    maxForecastDate: DateTime.now(),
  }),
}))

jest.mock('./average-comparison-chart/AverageComparisonChart', () => ({
  AverageComparisonChart: () => 'average chart',
}))
jest.mock('./site-measurement-chart/SiteMeasurementsChart', () => ({
  SiteMeasurementsChart: () => 'measurements chart',
}))
jest.mock('./station-map/StationMap', () => ({
  StationMap: () => 'mocked map',
}))

afterEach(cleanup)

describe('SingleCityComponent', () => {
  it('shows loading spinner when forecast data loading', async () => {
    ;(useQueries as jest.Mock).mockReturnValue([
      { data: [], isPending: true, isError: false },
      { data: [], isPending: false, isError: false },
    ])
    render(<SingleCity />)
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })
  it('shows loading spinner when measurement data loading', async () => {
    ;(useQueries as jest.Mock).mockReturnValue([
      { data: [], isPending: false, isError: false },
      { data: [], isPending: true, isError: false },
    ])
    render(<SingleCity />)
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })
  it('shows message when loading forecast data errors', async () => {
    ;(useQueries as jest.Mock).mockReturnValue([
      { data: [], isPending: false, isError: true },
      { data: [], isPending: false, isError: false },
    ])
    render(<SingleCity />)
    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument()
    })
  })
  it('shows message when loading measurement data errors', async () => {
    ;(useQueries as jest.Mock).mockReturnValue([
      { data: [], isPending: false, isError: false },
      { data: [], isPending: false, isError: true },
    ])
    render(<SingleCity />)
    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument()
    })
  })
  describe('when data loaded', () => {
    it('shows the site measurements section', async () => {
      ;(useQueries as jest.Mock).mockReturnValue([
        { data: [], isPending: false, isError: false },
        { data: [], isPending: false, isError: false },
      ]),
        render(<SingleCity />)
      await waitFor(() => {
        expect(screen.getByText('Measurement Sites')).toBeInTheDocument()
      })
    })
    it('shows the map if forecast data', async () => {
      ;(useQueries as jest.Mock).mockReturnValue([
        { data: ['one'], isPending: false, isError: false },
        {
          data: [
            { site_name: 'Banana', location: { latitude: 1, longitude: 2 } },
          ],
          isPending: false,
          isError: false,
        },
      ]),
        render(<SingleCity />)
      await waitFor(() => {
        expect(screen.getByText('mocked map')).toBeInTheDocument()
      })
    })
    it('does not show the map if no forecast data', async () => {
      ;(useQueries as jest.Mock).mockReturnValue([
        { data: [], isPending: false, isError: false },
        { data: [], isPending: false, isError: false },
      ]),
        render(<SingleCity />)
      await waitFor(() => {
        expect(screen.queryByText('mocked map')).not.toBeInTheDocument()
      })
    })
    it('displays pollutant charts when all have values', async () => {
      ;(useQueries as jest.Mock).mockReturnValue([
        { data: [], isPending: false, isError: false },
        {
          data: [
            mockMeasurementResponseDto({
              no2: 1,
              o3: 1,
              so2: 1,
              site_name: 'Site 1',
            }),
            mockMeasurementResponseDto({
              pm10: 1,
              pm2_5: 1,
              site_name: 'Site 2',
            }),
          ],
          isPending: false,
          isError: false,
        },
      ])
      render(<SingleCity />)
      await waitFor(() => {
        pollutantTypes.forEach((type) => {
          expect(
            screen.getByTestId(`site_measurements_chart_${type}`),
          ).toBeInTheDocument()
        })
      })
    })
    it('displays pollutant charts with no measurement data', async () => {
      ;(useQueries as jest.Mock).mockReturnValue([
        { data: [], isPending: false, isError: false },
        {
          data: [
            mockMeasurementResponseDto({
              no2: 1,
              site_name: 'Site 1',
            }),
          ],
          isPending: false,
          isError: false,
        },
      ])
      render(<SingleCity />)
      await waitFor(() => {
        pollutantTypes.forEach((type) => {
          expect(
            screen.queryByTestId(`site_measurements_chart_${type}`),
          ).toBeInTheDocument()
        })
      })
    })
    describe('site selection', () => {
      beforeEach(() => {
        ;(useQueries as jest.Mock).mockReturnValue([
          { data: [], isPending: false, isError: false },
          {
            data: [
              mockMeasurementResponseDto({
                no2: 1,
                o3: 1,
                so2: 1,
                site_name: 'Site 1',
              }),
              mockMeasurementResponseDto({
                pm10: 1,
                pm2_5: 1,
                site_name: 'Site 2',
              }),
            ],
            isPending: false,
            isError: false,
          },
        ])
      })
      it('should select all by default', async () => {
        render(<SingleCity />)
        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: /Site 1/i }),
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: /Site 2/i }),
          ).toBeInTheDocument()
        })
      })
      it('should still show chart when sites are deselected resulting in no measurements', async () => {
        render(<SingleCity />)
        await act(async () => {
          ;(await screen.findByLabelText('Remove Site 1')).click()
        })
        await waitFor(() => {
          expect(screen.queryByRole('button', { name: /Site 1/i })).toBeNull()
          ;['no2', 'o3', 'so2'].forEach((type) => {
            expect(
              screen.queryByTestId(`site_measurements_chart_${type}`),
            ).toBeInTheDocument()
          })
          ;['pm2_5', 'pm10'].forEach((type) => {
            expect(
              screen.getByTestId(`site_measurements_chart_${type}`),
            ).toBeInTheDocument()
          })
        })
      })
    })
  })
})
