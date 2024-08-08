import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import { AverageComparisonChart } from './AverageComparisonChart'
import {
  mockForecastResponseDto,
  mockMeasurementResponseDto,
} from '../../../test-util/mock-type-creator'

jest.mock('echarts-for-react', () => () => <div>Mock Chart</div>)

jest.mock('../../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.now(),
    maxInSituDate: DateTime.now(),
    maxForecastDate: DateTime.now(),
  }),
}))

describe('AverageComparisonChart', () => {
  it('renders with no data', async () => {
    render(
      <AverageComparisonChart
        cityName="city-name"
        forecastBaseTime={DateTime.fromISO('2024-05-25T09:00:00.00+00:00')}
        measurementsData={undefined}
        forecastData={undefined}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Mock Chart')).toBeInTheDocument()
    })
  })
  it('renders with forecast data and measurement data', async () => {
    render(
      <AverageComparisonChart
        cityName="city-name"
        forecastData={[mockForecastResponseDto()]}
        measurementsData={[mockMeasurementResponseDto()]}
        forecastBaseTime={DateTime.fromISO('2024-05-25T09:00:00.00+00:00')}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Mock Chart')).toBeInTheDocument()
    })
  })
})
