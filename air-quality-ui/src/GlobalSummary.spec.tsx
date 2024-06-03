import { render } from '@testing-library/react'

import GlobalSummary from './GlobalSummary'

it('Renders', () => {
  render(<GlobalSummary />)
  expect(true).toBeTruthy()
})
