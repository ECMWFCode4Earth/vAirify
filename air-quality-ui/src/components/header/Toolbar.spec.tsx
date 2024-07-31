import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { DateTime, Settings } from 'luxon'

import { Toolbar } from './Toolbar'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useMatches: jest.fn().mockReturnValue([]),
}))

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

describe('Toolbar component', () => {
  // it('renders toolbar', () => {
  //   render(<Toolbar />)
  //   expect(screen.getByRole('toolbar')).toBeInTheDocument()
  // })

  // it('Updates date when date picker is used and ok button is clicked', () => {
  //   render(<Toolbar />)
  //   const datePicker = screen.getByLabelText('Forecast Base Date')
  //   const updatedDate = DateTime.fromISO('2024-05-26T12:00:00', { zone: 'UTC' })

  //   fireEvent.change(datePicker, { target: { value: '26/05/2024 12:00' } })
  //   fireEvent.click(screen.getByText('Ok'))
  //   expect(mockSetForecastBaseDate).toHaveBeenCalledWith(updatedDate)
  // })

  it('Invalid date stops button from being used, selected time should not have change', () => {
    render(<Toolbar />)
    const datePicker = screen.getByLabelText('Forecast Base Date')
    fireEvent.change(datePicker, {
      target: { value: '03/08/2024 12:00' },
    })
    fireEvent.click(screen.getByText('Ok'))
    expect(mockSetForecastBaseDate).not.toHaveBeenCalled()
  })

  it('Invalid time stops button from being used, selected time should not have change', () => {
    render(<Toolbar />)
    const datePicker = screen.getByLabelText('Forecast Base Date')
    fireEvent.change(datePicker, {
      target: { value: '03/04/2024 10:00' },
    })
    fireEvent.click(screen.getByText('Ok'))
    expect(mockSetForecastBaseDate).not.toHaveBeenCalled()
  })
})
