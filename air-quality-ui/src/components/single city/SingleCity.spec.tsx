import { render } from '@testing-library/react'

import SingleCity from './SingleCity'

it('Renders', () => {
  render(<SingleCity />)
  expect(true).toBeTruthy()
})
