import '@testing-library/jest-dom'
import { useQueries, useQuery } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import GlobalSummary from './GlobalSummary'
import { SummaryViewHeaderProps } from './SummaryViewHeader'
import { GlobalSummaryTableProps } from '../summary-grid/table/GlobalSummaryTable'

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn().mockReturnValue({ data: {}, isError: false }),
  useQueries: jest.fn().mockReturnValue({ data: {}, isError: false }),
}))

jest.mock('../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.now(),
    maxInSituDate: DateTime.now(),
  }),
}))

jest.mock('../../services/forecast-time-service', () => ({
  getValidForecastTimesBetween: jest
    .fn()
    .mockImplementation(() => [
      DateTime.fromISO('2024-06-01T03:00:00', { zone: 'UTC' }),
      DateTime.fromISO('2024-06-01T15:00:00', { zone: 'UTC' }),
    ]),
}))

let setShowAllColouredState: (val: boolean) => void

const mockSummaryViewHeader = jest
  .fn()
  .mockReturnValue(<span>mock summary header</span>)

jest.mock('./SummaryViewHeader', () => ({
  SummaryViewHeader: (props: SummaryViewHeaderProps) => {
    setShowAllColouredState = props.setShowAllColoured
    return mockSummaryViewHeader(props)
  },
}))

const mockGridSummaryTable = jest.fn().mockReturnValue(<span>mock grid</span>)
jest.mock(
  '../summary-grid/table/GlobalSummaryTable',
  () => (props: Partial<GlobalSummaryTableProps>) =>
    mockGridSummaryTable(props),
)

describe('GlobalSummary component', () => {
  it('shows loading spinner when forecast data is loading', async () => {
    ;(useQuery as jest.Mock).mockReturnValueOnce({
      data: null,
      isPending: true,
    })
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })
  it('shows loading spinner when summary data is loading', async () => {
    ;(useQueries as jest.Mock).mockReturnValueOnce({
      data: null,
      isPending: true,
    })
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })
  it('shows message when loading forecast data errors', async () => {
    ;(useQuery as jest.Mock).mockReturnValueOnce({
      data: null,
      isError: true,
    })
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
    })
  })
  it('shows message when loading summary data errors', async () => {
    ;(useQueries as jest.Mock).mockReturnValueOnce({
      data: null,
      isError: true,
    })
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
    })
  })
  it('shows the summary header', async () => {
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(screen.getByText('mock summary header')).toBeInTheDocument()
    })
  })
  it('shows the summary table', async () => {
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(screen.getByText('mock grid')).toBeInTheDocument()
    })
  })

  it('showAllColours variable to passed to GridSummaryTable set to true by default', async () => {
    render(<GlobalSummary />)
    await waitFor(() => {
      expect(mockGridSummaryTable).toHaveBeenCalledWith({
        forecast: {},
        summarizedMeasurements: {},
        showAllColoured: true,
      })
    })
  })

  it('showAllColours variable to passed to GridSummaryTable set to false when state is switched', async () => {
    render(<GlobalSummary />)
    setShowAllColouredState(false)
    await waitFor(() => {
      expect(mockGridSummaryTable).toHaveBeenCalledWith({
        forecast: {},
        summarizedMeasurements: {},
        showAllColoured: false,
      })
    })
  })
})
