import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

import { StationMap } from './StationMap'

jest.mock('../../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.now(),
    maxInSituDate: DateTime.now(),
    maxForecastDate: DateTime.now(),
  }),
}))

jest.mock('maplibre-gl', () => ({
  Marker: jest.fn(),
  Map: jest.fn(() => ({
    addControl: jest.fn(),
  })),
  FullscreenControl: jest.fn(),
}))

describe('StationMap', () => {
  it('renders', async () => {
    render(
      <StationMap
        forecastData={[
          {
            base_time: '',
            valid_time: '',
            overall_aqi_level: 4,
            location_type: 'city',
            location_name: 'brazil',
            o3: { aqi_level: 2, value: 2 },
            no2: { aqi_level: 1, value: 1 },
            so2: { aqi_level: 5, value: 5 },
            pm10: { aqi_level: 3, value: 3 },
            pm2_5: { aqi_level: 4, value: 4 },
            coordinates: { latitude: 1, longitude: 2 },
          },
        ]}
        locations={new Map()}
      />,
    )
    await waitFor(() => {
      expect(screen.queryByTestId('map')).toBeInTheDocument()
    })
  })
})
