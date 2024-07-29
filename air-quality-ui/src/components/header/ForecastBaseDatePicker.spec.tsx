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
    const pastDate = DateTime.utc().startOf('minute').plus({ days: -1 })

    fireEvent.change(datePicker, {
      target: { value: pastDate.toFormat("dd'/'LL'/'yyyy' 'HH':'mm") },
    })
    await waitFor(() => {
      expect(mockSetForecastBaseDate).toHaveBeenCalledWith(pastDate)
    })
  })
  it('Does not update forecast base date to future', async () => {
    render(<ForecastBaseDatePicker />)
    const futureDate = DateTime.utc().startOf('minute').plus({ days: 1 })

    const datePicker = screen.getByLabelText('Forecast Base Date')

    fireEvent.change(datePicker, {
      target: { value: futureDate.toFormat("dd'/'LL'/'yyyy' 'HH':'mm") },
    })
    await waitFor(() => {
      expect(mockSetForecastBaseDate).not.toHaveBeenCalledWith(futureDate)
    })
  })
})
