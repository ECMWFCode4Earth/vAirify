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
  it.each<number>([0, 12])(
    'Sets forecast base date on change for valid hour',
    async (test_hour: number) => {
      render(<ForecastBaseDatePicker />)
      const datePicker = screen.getByLabelText('Forecast Base Date')
      const pastDate = DateTime.utc()
        .startOf('day')
        .plus({ days: -2 })
        .set({ hour: test_hour })

      fireEvent.change(datePicker, {
        target: { value: pastDate.toFormat("dd'/'LL'/'yyyy' 'HH':'mm") },
      })
      await waitFor(() => {
        expect(mockSetForecastBaseDate).toHaveBeenCalledWith(pastDate)
      })
    },
  )
  it('Does not update forecast base date to future', async () => {
    render(<ForecastBaseDatePicker />)
    const futureDate = DateTime.utc()
      .startOf('day')
      .plus({ days: 2 })
      .set({ hour: 0 })

    const datePicker = screen.getByLabelText('Forecast Base Date')

    fireEvent.change(datePicker, {
      target: { value: futureDate.toFormat("dd'/'LL'/'yyyy' 'HH':'mm") },
    })
    await waitFor(() => {
      expect(mockSetForecastBaseDate).not.toHaveBeenCalledWith(futureDate)
    })
  })
  it.each<number>(Array.from({ length: 59 }, (_, i) => i + 1))(
    'Does not update forecast base date to include non-zero minutes',
    async (test_minute: number) => {
      render(<ForecastBaseDatePicker />)
      const futureDate = DateTime.utc()
        .startOf('day')
        .plus({ days: -2 })
        .set({ hour: 0, minute: test_minute })

      const datePicker = screen.getByLabelText('Forecast Base Date')

      fireEvent.change(datePicker, {
        target: { value: futureDate.toFormat("dd'/'LL'/'yyyy' 'HH':'mm") },
      })
      await waitFor(() => {
        expect(mockSetForecastBaseDate).not.toHaveBeenCalledWith(futureDate)
      })
    },
  )
  it.each<number>([2, 3, 4, 5, 6, 7, 8, 9, 10, 11])(
    'Does not update forecast base date to include invalid hours',
    async (test_hour: number) => {
      render(<ForecastBaseDatePicker />)
      const futureDate = DateTime.utc()
        .startOf('day')
        .plus({ days: -2 })
        .set({ hour: test_hour })

      const datePicker = screen.getByLabelText('Forecast Base Date')

      fireEvent.change(datePicker, {
        target: { value: futureDate.toFormat("dd'/'LL'/'yyyy' 'HH':'mm") },
      })
      await waitFor(() => {
        expect(mockSetForecastBaseDate).not.toHaveBeenCalledWith(futureDate)
      })
    },
  )
})
