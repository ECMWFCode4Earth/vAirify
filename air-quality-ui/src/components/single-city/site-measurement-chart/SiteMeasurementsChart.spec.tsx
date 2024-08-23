import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import { SiteMeasurementsChart } from './SiteMeasurementsChart'

jest.mock('echarts-for-react', () => () => <div>Mock Chart</div>)

jest.mock('../../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastDetails: {
      forecastBaseDate: DateTime.now(),
      maxMeasurementDate: DateTime.now(),
      maxForecastDate: DateTime.now(),
    },
  }),
}))

jest.mock('../../common/LoadingSpinner', () => ({
  LoadingSpinner: () => 'Mocked loading spinner',
}))

describe('AverageComparisonChart', () => {
  it('renders with loading spinner if no colours set', async () => {
    render(
      <SiteMeasurementsChart
        cityName="name"
        forecastData={[]}
        measurementsBySite={{}}
        pollutantType={'pm10'}
        onSiteClick={() => {}}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Mocked loading spinner')).toBeInTheDocument()
    })
  })
  it('renders with echarts if colours set', async () => {
    render(
      <SiteMeasurementsChart
        cityName="name"
        forecastData={[]}
        measurementsBySite={{}}
        pollutantType={'pm10'}
        onSiteClick={() => {}}
        seriesColorsBySite={{ Station1: 'Red' }}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Mock Chart')).toBeInTheDocument()
    })
  })
})
