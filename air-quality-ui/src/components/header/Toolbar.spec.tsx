import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { Toolbar } from './Toolbar'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useMatches: jest.fn().mockReturnValue([]),
}))

describe('Toolbar component', () => {
  it('renders toolbar', () => {
    render(<Toolbar />, {
      wrapper: BrowserRouter,
    })
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
  })
})
