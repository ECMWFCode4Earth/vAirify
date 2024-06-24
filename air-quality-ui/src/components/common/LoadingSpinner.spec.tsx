import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { LoadingSpinner } from './LoadingSpinner'

it('Renders', () => {
  render(<LoadingSpinner />)
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
})
