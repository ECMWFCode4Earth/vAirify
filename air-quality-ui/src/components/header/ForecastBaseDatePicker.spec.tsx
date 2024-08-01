import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import { ForecastBaseDatePicker } from './ForecastBaseDatePicker'
const isTimeInvalid = (value: DateTime) => {
  return value.minute != 0 || value.hour % 12 != 0
}
const mockSetSelectedForecastBaseDate: (val: DateTime) => void = jest.fn()
describe('ForecastBaseDatePicker component', () => {
  it('Displays date picker', async () => {
    render(
      <ForecastBaseDatePicker
        setSelectedForecastBaseDate={mockSetSelectedForecastBaseDate}
        forecastBaseDate={DateTime.fromISO('2024-06-01T03:00:00', {
          zone: 'utc',
        })}
        isTimeInvalid={isTimeInvalid}
      />,
    )
    expect(screen.getByLabelText('Forecast Base Date')).toBeInTheDocument()
  })
  it.each<number>([0, 12])(
    'Sets forecast base date on change for valid hour',
    async (test_hour: number) => {
      render(
        <ForecastBaseDatePicker
          setSelectedForecastBaseDate={mockSetSelectedForecastBaseDate}
          isTimeInvalid={isTimeInvalid}
          forecastBaseDate={DateTime.fromISO('2024-06-01T03:00:00', {
            zone: 'utc',
          })}
        />,
      )
      const datePicker = screen.getByLabelText('Forecast Base Date')
      const pastDate = DateTime.utc()
        .startOf('day')
        .plus({ days: -2 })
        .set({ hour: test_hour })

      fireEvent.change(datePicker, {
        target: { value: pastDate.toFormat("dd'/'LL'/'yyyy' 'HH':'mm") },
      })
      await waitFor(() => {
        expect(mockSetSelectedForecastBaseDate).toHaveBeenCalledWith(pastDate)
      })
    },
  )
  it.each<number>(Array.from({ length: 59 }, (_, i) => i + 1))(
    'Does not update forecast base date to include non-zero minutes',
    async (test_minute: number) => {
      render(
        <ForecastBaseDatePicker
          setSelectedForecastBaseDate={mockSetSelectedForecastBaseDate}
          isTimeInvalid={isTimeInvalid}
          forecastBaseDate={DateTime.fromISO('2024-06-01T03:00:00', {
            zone: 'utc',
          })}
        />,
      )
      const futureDate = DateTime.utc()
        .startOf('day')
        .plus({ days: -2 })
        .set({ hour: 0, minute: test_minute })

      const datePicker = screen.getByLabelText('Forecast Base Date')

      fireEvent.change(datePicker, {
        target: { value: futureDate.toFormat("dd'/'LL'/'yyyy' 'HH':'mm") },
      })
      await waitFor(() => {
        expect(mockSetSelectedForecastBaseDate).not.toHaveBeenCalledWith(
          futureDate,
        )
      })
    },
  )
})
