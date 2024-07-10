import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'

import { AverageComparisonChart } from './AverageComparisonChart'
import { mockForecastResponseDto } from '../../../test-util/mock-type-creator'

jest.mock('echarts-for-react', () => () => <div>Mock Chart</div>)

describe('AverageComparisonChart', () => {
  it('renders with no data', async () => {
    render(<AverageComparisonChart />)
    await waitFor(() => {
      expect(screen.getByText('Mock Chart')).toBeInTheDocument()
    })
  })
  it('renders with forecast data', async () => {
    render(
      <AverageComparisonChart forecastData={[mockForecastResponseDto()]} />,
    )
    await waitFor(() => {
      expect(screen.getByText('Mock Chart')).toBeInTheDocument()
    })
  })
})
