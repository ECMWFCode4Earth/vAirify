import { render } from '@testing-library/react'

import GlobalSummary from './GlobalSummary'

jest.mock('@tanstack/react-query', () => ({
  useQueries: jest
    .fn()
    .mockReturnValue({ data: [], isPending: false, isError: false }),
}))

it('Renders', () => {
  render(<GlobalSummary />)
  expect(true).toBeTruthy()
})
