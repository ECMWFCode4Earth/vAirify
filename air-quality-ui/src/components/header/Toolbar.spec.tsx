import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { Toolbar } from './Toolbar'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useMatches: jest.fn().mockReturnValue([]),
}))

jest.mock('./Breadcrumbs', () => ({ Breadcrumbs: () => 'mocked breadcrumbs' }))
jest.mock('./ForecastBaseDatePicker', () => ({
  ForecastBaseDatePicker: () => 'mocked datepicker',
}))

describe('Toolbar component', () => {
  it('renders toolbar', () => {
    render(<Toolbar />)
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
  })
})
