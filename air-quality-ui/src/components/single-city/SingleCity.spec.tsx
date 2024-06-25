import '@testing-library/jest-dom'
import { useQueries } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'

import { SingleCity } from './SingleCity'
import { pollutantTypes } from '../../models'
import { mockMeasurementResponseDto } from '../../test-util/mock-type-creator'

jest.mock('@tanstack/react-query', () => ({
  useQueries: jest.fn().mockReturnValue([
    { data: [], isPending: false, isError: false },
    { data: [], isPending: false, isError: false },
  ]),
}))

jest.mock('echarts-for-react', () => () => <div>Mock Chart</div>)

describe('SingleCityComponent', () => {
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
  it('shows spinner when loading forecast data', async () => {
    ;(useQueries as jest.Mock).mockReturnValue([
      { data: [], isPending: true, isError: false },
      { data: [], isPending: false, isError: false },
    ])
    render(<SingleCity />)
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })
  it('shows spinner when loading measurement data', async () => {
    ;(useQueries as jest.Mock).mockReturnValue([
      { data: [], isPending: false, isError: false },
      { data: [], isPending: true, isError: false },
    ])
    render(<SingleCity />)
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
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
        expect(screen.getByText('Site Measurements')).toBeInTheDocument()
      })
    })
    it('groups data correctly by site for display (all pollutants)', async () => {
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
    it('groups data correctly by site for display (single pollutant)', async () => {
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
        expect(
          screen.getByTestId(`site_measurements_chart_no2`),
        ).toBeInTheDocument()
        pollutantTypes
          .filter((type) => type !== 'no2')
          .forEach((type) => {
            expect(
              screen.queryByTestId(`site_measurements_chart_${type}`),
            ).toBeNull()
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
      it('should hide charts when sites are deselected resulting in no measurements', async () => {
        render(<SingleCity />)
        await act(async () => {
          ;(await screen.findByLabelText('Remove Site 1')).click()
        })
        await waitFor(() => {
          expect(screen.queryByRole('button', { name: /Site 1/i })).toBeNull()
          ;['no2', 'o3', 'so2'].forEach((type) => {
            expect(
              screen.queryByTestId(`site_measurements_chart_${type}`),
            ).toBeNull()
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
