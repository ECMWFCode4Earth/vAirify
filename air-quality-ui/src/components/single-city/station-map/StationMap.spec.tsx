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
        mapCenter={{ latitude: 1, longitude: 2 }}
        stations={{}}
        visibleLocations={['']}
      />,
    )
    await waitFor(() => {
      expect(screen.queryByTestId('map')).toBeInTheDocument()
    })
  })
})
