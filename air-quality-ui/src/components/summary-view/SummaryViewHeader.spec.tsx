import '@testing-library/jest-dom'
import { act, render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import { SummaryViewHeader } from './SummaryViewHeader'

jest.mock('../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.fromISO('2024-06-01T03:00:00', { zone: 'utc' }),
    maxInSituDate: DateTime.fromISO('2024-06-10T09:00:00', { zone: 'utc' }),
  }),
}))

const mockSetShowAllColoured: (val: boolean) => void = jest.fn()

describe('SummaryViewHeader component', () => {
  it('Shows correct message for context dates', async () => {
    render(
      <SummaryViewHeader
        showAllColoured={false}
        setShowAllColoured={mockSetShowAllColoured}
      />,
    )
    await waitFor(() => {
      expect(
        screen.getByText('Time Range: 01 Jun 03:00 - 10 Jun 09:00 UTC'),
      ).toBeInTheDocument()
    })
  })
  it('Calls setShowAllColoured on switch click', async () => {
    render(
      <SummaryViewHeader
        showAllColoured={false}
        setShowAllColoured={mockSetShowAllColoured}
      />,
    )
    await act(async () => {
      ;(await screen.getByTestId('aqi-highlight-switch')).click()
    })
    await waitFor(() => {
      expect(mockSetShowAllColoured).toHaveBeenCalledWith(true)
    })
  })
})
