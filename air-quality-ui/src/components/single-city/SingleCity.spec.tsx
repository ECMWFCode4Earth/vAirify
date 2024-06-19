import { render } from '@testing-library/react'

import SingleCity from './SingleCity'

jest.mock('echarts-for-react', () => () => <div></div>)

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest
    .fn()
    .mockReturnValue({ data: [], isPending: false, isError: false }),
}))

it('Renders', () => {
  const screen = render(<SingleCity />)
  expect(screen.getByTestId('chart')).toBeTruthy()
})
