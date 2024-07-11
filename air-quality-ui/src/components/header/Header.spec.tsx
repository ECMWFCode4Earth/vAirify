import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { Header } from './Header'

jest.mock('./Toolbar', () => ({ Toolbar: () => 'mocked toolbar' }))

describe('Header component', () => {
  it('shows application name', () => {
    render(<Header />)
    expect(screen.getByTestId('vairify-logo')).toBeInTheDocument()
  })
})
