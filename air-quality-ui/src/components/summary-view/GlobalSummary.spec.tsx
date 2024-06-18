import '@testing-library/jest-dom'
import { useQueries } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import GlobalSummary from './GlobalSummary'

jest.mock('@tanstack/react-query', () => ({
  useQueries: jest
    .fn()
    .mockReturnValue({ data: [], isPending: false, isError: false }),
}))

jest.mock('../../services/forecast-time-service', () => ({
  getLatestBaseForecastTime: jest
    .fn()
    .mockImplementation(() =>
      DateTime.fromISO('2024-06-01T00:00:00', { zone: 'UTC' }),
    ),
  getLatestValidForecastTime: jest
    .fn()
    .mockImplementation(() =>
      DateTime.fromISO('2024-06-01T12:00:00', { zone: 'UTC' }),
    ),
}))

describe('GlobalSummary component', () => {
  it('shows message when loading data errors', async () => {
    ;(useQueries as jest.Mock).mockReturnValueOnce({
      data: null,
      isPending: false,
      isError: true,
    })
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
    })
  })
  it('shows forecast base time', async () => {
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(
        screen.getByText('Forecast Base Time: 2024-06-01 00:00 UTC'),
      ).toBeInTheDocument()
    })
  })
  it('shows forecast valid time', async () => {
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(
        screen.getByText('Forecast Valid Time: 2024-06-01 12:00 UTC'),
      ).toBeInTheDocument()
    })
  })
  it('shows the summary table', async () => {
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(screen.getByTestId('summary-grid')).toBeInTheDocument()
    })
  })
})
