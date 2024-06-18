import '@testing-library/jest-dom'
import { useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

import { SingleCity } from './SingleCity'
import { pollutantTypes } from '../../models'
import { mockMeasurementResponseDto } from '../../test-util/mock-type-creator'

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest
    .fn()
    .mockReturnValue({ data: [], isPending: false, isError: false }),
}))

jest.mock('echarts-for-react', () => () => <div>Mock Chart</div>)

describe('SingleCityComponent', () => {
  it('shows message when loading data errors', async () => {
    ;(useQuery as jest.Mock).mockReturnValueOnce({
      isPending: false,
      isError: true,
    })
    render(<SingleCity />)
    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument()
    })
  })
  it('shows spinner when loading data', async () => {
    ;(useQuery as jest.Mock).mockReturnValueOnce({
      isPending: true,
      isError: false,
    })
    render(<SingleCity />)
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })
  describe('when data loaded', () => {
    it('shows the site measurements section', async () => {
      render(<SingleCity />)
      await waitFor(() => {
        expect(screen.getByText('Site Measurements')).toBeInTheDocument()
      })
    })
    it('groups data correctly by site for display (all pollutants)', async () => {
      ;(useQuery as jest.Mock).mockReturnValueOnce({
        data: [
          mockMeasurementResponseDto({
            no2: 1,
            o3: 1,
            so2: 1,
            location_name: 'location 1',
          }),
          mockMeasurementResponseDto({
            pm10: 1,
            pm2_5: 1,
            location_name: 'location 2',
          }),
        ],
        isPending: false,
        isError: false,
      })
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
      ;(useQuery as jest.Mock).mockReturnValueOnce({
        data: [
          mockMeasurementResponseDto({
            no2: 1,
            location_name: 'location 1',
          }),
        ],
        isPending: false,
        isError: false,
      })
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
  })
})
