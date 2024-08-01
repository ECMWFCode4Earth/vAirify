import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { DateTime, Settings } from 'luxon'
import React from 'react'

import { Toolbar } from './Toolbar'
import { ForecastBaseDatePicker } from './ForecastBaseDatePicker'

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
jest.mock('./ForecastBaseDatePicker', () => ({
  ForecastBaseDatePicker: () => 'mocked ForecastBaseDatePicker',
}))
describe('Toolbar component', () => {
  it('renders toolbar', () => {
    render(<Toolbar />)

    expect(screen.getByRole('toolbar')).toBeInTheDocument()

    ForecastBaseDatePicker
  })
  React.useState = jest
    .fn()
    .mockReturnValueOnce([
      DateTime.fromISO('2024-08-01T12:00:00', { zone: 'UTC' }),
      {},
    ])
  test('Invalid date stops button from being used, selected time should not have change', () => {
    render(<Toolbar />)

    fireEvent.click(screen.getByText('Ok'))
    expect(mockSetForecastBaseDate).not.toHaveBeenCalled()
  })
  //.each<number>([
  //   2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  // ])
  // it('Invalid time stops button from being used, selected time should not have change', () => {
  //   render(<Toolbar />)
  //   const datePicker = screen.getByLabelText('Forecast Base Date')
  //   fireEvent.change(datePicker, {
  //     target: { value: '03/04/2024 10:00' },
  //   })
  //   fireEvent.click(screen.getByText('Ok'))
  //   expect(mockSetForecastBaseDate).not.toHaveBeenCalled()
  // })
})
