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

const mockLngLat = jest.fn(() => ({
  setPopup: jest.fn(() => ({
    addTo: jest.fn(),
  })),
}))

jest.mock('maplibre-gl', () => ({
  Marker: jest.fn(() => ({
    setLngLat: mockLngLat,
  })),
  Popup: jest.fn(() => ({
    setText: jest.fn(),
  })),
  Map: jest.fn(() => ({
    addControl: jest.fn(),
  })),
  FullscreenControl: jest.fn(),
}))

describe('StationMap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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

  it('marker location set correctly', async () => {
    render(
      <StationMap
        mapCenter={{ latitude: 1, longitude: 2 }}
        stations={{
          stationA: { name: 'stationA', latitude: 1, longitude: 2 },
        }}
        visibleLocations={['']}
      />,
    )
    expect(mockLngLat).toHaveBeenCalledTimes(1)
    expect(mockLngLat).toHaveBeenCalledWith([2, 1])
  })

  it('multiple markers set', async () => {
    render(
      <StationMap
        mapCenter={{ latitude: 1, longitude: 2 }}
        stations={{
          stationA: { name: 'stationA', latitude: 1, longitude: 2 },
          stationB: { name: 'stationB', latitude: 3, longitude: 4 },
          stationC: { name: 'stationC', latitude: 5, longitude: 6 },
        }}
        visibleLocations={['']}
      />,
    )
    expect(mockLngLat).toHaveBeenCalledTimes(3)
    expect(mockLngLat).toHaveBeenNthCalledWith(1, [2, 1])
    expect(mockLngLat).toHaveBeenNthCalledWith(2, [4, 3])
    expect(mockLngLat).toHaveBeenNthCalledWith(3, [6, 5])
  })
})
