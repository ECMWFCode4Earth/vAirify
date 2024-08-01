import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DateTime, Settings } from 'luxon'

import { ForecastBaseDatePickerProps } from './ForecastBaseDatePicker'
import { Toolbar } from './Toolbar'

const mockSetForecastBaseDate: (val: DateTime) => void = jest.fn()

const dateNow = DateTime.fromISO('2024-06-01T12:00:00', { zone: 'UTC' })
Settings.now = () => dateNow.toMillis()

jest.mock('../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.fromISO('2024-06-01T12:00:00', { zone: 'UTC' }),
    maxInSituDate: DateTime.fromISO('2024-06-10T09:00:00', { zone: 'utc' }),
    setForecastBaseDate: (x: DateTime) => mockSetForecastBaseDate(x),
  }),
}))

jest.mock('./Breadcrumbs', () => ({ Breadcrumbs: () => 'mocked breadcrumbs' }))

const mockForecastBaseDatePicker = jest
  .fn()
  .mockReturnValue(<span>mock ForecastBaseDatePicker</span>)

let setIsInvalidDateTime: (val: boolean) => void
let setSelectedForecastBaseDate: (val: DateTime<boolean>) => void

jest.mock('./ForecastBaseDatePicker', () => ({
  ForecastBaseDatePicker: (props: ForecastBaseDatePickerProps) => {
    setIsInvalidDateTime = props.setIsInvalidDateTime
    setSelectedForecastBaseDate = props.setSelectedForecastBaseDate
    return mockForecastBaseDatePicker(props)
  },
}))

describe('Toolbar component', () => {
  it('renders toolbar', () => {
    render(<Toolbar />)
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
  })
  it('Invalid date stops button from being used', async () => {
    render(<Toolbar />)
    setIsInvalidDateTime(true)
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('disabled')
    })
  })
  it('Valid date allows button to be used', async () => {
    render(<Toolbar />)
    setIsInvalidDateTime(false)
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toHaveAttribute('disabled')
    })
  })
  it('Setting valid date and clicking button updates context', async () => {
    render(<Toolbar />)
    await waitFor(() => {
      setSelectedForecastBaseDate(
        DateTime.fromISO('2024-06-10T09:00:00', { zone: 'utc' }),
      )
    })
    fireEvent.click(screen.getByText('Ok'))
    await waitFor(() => {
      expect(mockSetForecastBaseDate).toHaveBeenCalledWith(
        DateTime.fromISO('2024-06-10T09:00:00', { zone: 'utc' }),
      )
    })
  })
  it('Setting invalid date and clicking button does not update context', async () => {
    render(<Toolbar />)
    await waitFor(() => {
      setSelectedForecastBaseDate(
        DateTime.fromISO('2024-08-10T09:00:00', { zone: 'utc' }),
      )
    })
    await waitFor(() => {
      setIsInvalidDateTime(true)
    })
    fireEvent.click(screen.getByText('Ok'))
    await waitFor(() => {
      expect(mockSetForecastBaseDate).not.toHaveBeenCalledWith(
        DateTime.fromISO('2024-08-10T09:00:00', { zone: 'utc' }),
      )
    })
  })
})
