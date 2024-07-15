import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import { BaseForecastDatetimePicker } from './BaseForecastDatetimePicker'

const mockSetBaseForecastDateTime: (val: DateTime) => void = jest.fn()

jest.mock('../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.fromISO('2024-06-01T03:00:00', { zone: 'utc' }),
    maxInSituDate: DateTime.fromISO('2024-06-10T09:00:00', { zone: 'utc' }),
    setForecastBaseDate: (x: DateTime) => mockSetBaseForecastDateTime(x),
  }),
}))

describe('BaseForecastDatetimePicker component', () => {
  it('Displays date picker', async () => {
    render(<BaseForecastDatetimePicker />)
    expect(screen.getByLabelText('Base Forecast Date')).toBeInTheDocument()
  })
  it('Sets forecast base date on change', async () => {
    render(<BaseForecastDatetimePicker />)
    const datePicker = screen.getByLabelText('Base Forecast Date')
    const updatedDate = DateTime.fromISO('2024-06-03T12:00:00', { zone: 'UTC' })

    fireEvent.change(datePicker, { target: { value: '03/06/2024 12:00' } })
    await waitFor(() => {
      expect(mockSetBaseForecastDateTime).toHaveBeenCalledWith(updatedDate)
    })
  })
})
