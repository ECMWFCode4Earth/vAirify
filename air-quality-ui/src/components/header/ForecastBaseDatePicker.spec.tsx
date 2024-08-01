import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import { ForecastBaseDatePicker } from './ForecastBaseDatePicker'

const mockSetSelectedForecastBaseDate: (val: DateTime) => void = jest.fn()
const mockSetIsInvalidDateTime: (value: boolean) => void = jest.fn()
describe('ForecastBaseDatePicker component', () => {
  it('Displays date picker', async () => {
    render(
      <ForecastBaseDatePicker
        setSelectedForecastBaseDate={mockSetSelectedForecastBaseDate}
        forecastBaseDate={DateTime.fromISO('2024-06-01T03:00:00', {
          zone: 'utc',
        })}
        setIsInvalidDateTime={mockSetIsInvalidDateTime}
      />,
    )
    expect(screen.getByLabelText('Forecast Base Date')).toBeInTheDocument()
  })
  it.each<number>([0, 12])(
    'If valid time (%d) is selected isinvalidDateTime is set to false',
    async (test_hour: number) => {
      render(
        <ForecastBaseDatePicker
          setSelectedForecastBaseDate={mockSetSelectedForecastBaseDate}
          setIsInvalidDateTime={mockSetIsInvalidDateTime}
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
      expect(mockSetIsInvalidDateTime).toHaveBeenCalledWith(false)
    },
  )
  it('If future date is selected isInvalidDateTime is set to true', async () => {
    render(
      <ForecastBaseDatePicker
        setSelectedForecastBaseDate={mockSetSelectedForecastBaseDate}
        setIsInvalidDateTime={mockSetIsInvalidDateTime}
        forecastBaseDate={DateTime.fromISO('2024-06-01T03:00:00', {
          zone: 'utc',
        })}
      />,
    )
    const futureDate = DateTime.utc()
      .startOf('day')
      .plus({ days: 2 })
      .set({ hour: 0 })

    const datePicker = screen.getByLabelText('Forecast Base Date')

    fireEvent.change(datePicker, {
      target: { value: futureDate.toFormat("dd'/'LL'/'yyyy' 'HH':'mm") },
    })
    await waitFor(() => {
      expect(mockSetIsInvalidDateTime).toHaveBeenCalledWith(true)
    })
  })
  it.each<number>(Array.from({ length: 59 }, (_, i) => i + 1))(
    'If includes non-zero minutes isinvalidDateTime is set to true',
    async (test_minute: number) => {
      render(
        <ForecastBaseDatePicker
          setSelectedForecastBaseDate={mockSetSelectedForecastBaseDate}
          setIsInvalidDateTime={mockSetIsInvalidDateTime}
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
        expect(mockSetIsInvalidDateTime).toHaveBeenCalledWith(true)
      })
    },
  )
  it.each<number>([
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ])(
    'If includes invalid hours isinvalidDateTime is set to true ',
    async (test_hour: number) => {
      render(
        <ForecastBaseDatePicker
          setSelectedForecastBaseDate={mockSetSelectedForecastBaseDate}
          setIsInvalidDateTime={mockSetIsInvalidDateTime}
          forecastBaseDate={DateTime.fromISO('2024-06-01T03:00:00', {
            zone: 'utc',
          })}
        />,
      )
      const futureDate = DateTime.utc()
        .startOf('day')
        .plus({ days: -2 })
        .set({ hour: test_hour })

      const datePicker = screen.getByLabelText('Forecast Base Date')

      fireEvent.change(datePicker, {
        target: { value: futureDate.toFormat("dd'/'LL'/'yyyy' 'HH':'mm") },
      })
      await waitFor(() => {
        expect(mockSetIsInvalidDateTime).toHaveBeenCalledWith(true)
      })
    },
  )
})
