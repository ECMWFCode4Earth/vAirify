import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import { SiteMeasurementsChart } from './SiteMeasurementsChart'

jest.mock('echarts-for-react', () => () => <div>Mock Chart</div>)

jest.mock('../../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.now(),
    maxInSituDate: DateTime.now(),
    maxForecastDate: DateTime.now(),
  }),
}))

describe('AverageComparisonChart', () => {
  it('renders with forecast data and measurement data', async () => {
    render(
      <SiteMeasurementsChart
        forecastData={[]}
        measurementsBySite={{}}
        pollutantType={'pm10'}
        onSiteClick={() => {}}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Mock Chart')).toBeInTheDocument()
    })
  })
})
