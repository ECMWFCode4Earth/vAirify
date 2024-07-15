import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DateTime } from 'luxon'

import { SiteMeasurementsChart } from './SiteMeasurementsChart'
import { PollutantType } from '../../../models'

jest.mock('echarts-for-react', () => () => <div>Mock Chart</div>)

jest.mock('../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.now(),
    maxInSituDate: DateTime.now(),
    maxForecastDate: DateTime.now(),
  }),
}))

describe('SiteMeasurementChart', () => {
  it.each<[PollutantType, string]>([
    ['no2', 'Nitrogen Dioxide'],
    ['so2', 'Sulphur Dioxide'],
    ['o3', 'Ozone'],
    ['pm10', 'PM 10'],
    ['pm2_5', 'PM 2.5'],
  ])(
    'should display the correct label for pollutant: %s',
    (pollutantType, expectedLabel) => {
      render(
        <SiteMeasurementsChart
          forecastData={[]}
          measurementsBySite={{}}
          pollutantType={pollutantType}
          onSiteClick={() => {}}
        />,
      )
      expect(screen.getByText(expectedLabel)).toBeInTheDocument()
    },
  )
})
