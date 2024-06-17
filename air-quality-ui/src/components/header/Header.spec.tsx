import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { Header } from './Header'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useMatches: jest.fn().mockReturnValue([]),
}))

describe('Header component', () => {
  it('shows application name', () => {
    render(<Header />, {
      wrapper: BrowserRouter,
    })
    expect(screen.getByRole('banner')).toHaveTextContent('vAirify')
  })
})
