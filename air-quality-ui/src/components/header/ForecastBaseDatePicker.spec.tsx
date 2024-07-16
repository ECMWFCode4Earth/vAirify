import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import { ForecastBaseDatePicker } from './ForecastBaseDatePicker'

const mockSetForecastBaseDate: (val: DateTime) => void = jest.fn()

jest.mock('../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.fromISO('2024-06-01T03:00:00', { zone: 'utc' }),
    maxInSituDate: DateTime.fromISO('2024-06-10T09:00:00', { zone: 'utc' }),
    setForecastBaseDate: (x: DateTime) => mockSetForecastBaseDate(x),
  }),
}))

describe('ForecastBaseDatePicker component', () => {
  it('Displays date picker', async () => {
    render(<ForecastBaseDatePicker />)
    expect(screen.getByLabelText('Forecast Base Date')).toBeInTheDocument()
  })
  it('Sets forecast base date on change', async () => {
    render(<ForecastBaseDatePicker />)
    const datePicker = screen.getByLabelText('Forecast Base Date')
    const updatedDate = DateTime.fromISO('2024-06-03T12:00:00', { zone: 'UTC' })

    fireEvent.change(datePicker, { target: { value: '03/06/2024 12:00' } })
    await waitFor(() => {
      expect(mockSetForecastBaseDate).toHaveBeenCalledWith(updatedDate)
    })
  })
})
