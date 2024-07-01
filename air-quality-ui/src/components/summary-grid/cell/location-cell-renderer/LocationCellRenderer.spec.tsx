import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { LocationCellRenderer } from './LocationCellRenderer'

describe('LocationCellRenderer component', () => {
  it('renders the location', () => {
    render(<LocationCellRenderer value={'Bristol'} />, {
      wrapper: BrowserRouter,
    })
    expect(screen.getByRole('link')).toHaveTextContent('Bristol')
    expect(screen.getByRole('link')).toHaveAttribute('href', '/city/Bristol')
  })
})
