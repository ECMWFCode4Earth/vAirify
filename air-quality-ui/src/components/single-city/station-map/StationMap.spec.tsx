import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'
import * as libre from 'maplibre-gl'

import { StationMap } from './StationMap'

jest.mock('../../../context', () => ({
  useForecastContext: jest.fn().mockReturnValue({
    forecastBaseDate: DateTime.now(),
    maxInSituDate: DateTime.now(),
    maxForecastDate: DateTime.now(),
  }),
}))

const mockAddTo = jest.fn()
const mockLngLat = jest.fn()
const mockMarkerRemove = jest.fn()
jest.mock('maplibre-gl', () => ({
  Marker: jest.fn().mockImplementation(() => {
    return {
      setLngLat: mockLngLat,
      addTo: mockAddTo,
      setPopup: jest.fn(),
      remove: mockMarkerRemove,
      getLngLat: jest.fn(() => ({ lat: 1, lng: 2 })),
      _color: '#123456',
    }
  }),
  Popup: jest.fn(() => ({
    setDOMContent: jest.fn(),
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
        addSite={() => {}}
        removeSite={() => {}}
        stationColors={{}}
      />,
    )
    await waitFor(() => {
      expect(screen.queryByTestId('map')).toBeInTheDocument()
    })
  })

  it('marker created correctly', async () => {
    render(
      <StationMap
        mapCenter={{ latitude: 1, longitude: 2 }}
        stations={{
          stationA: { name: 'stationA', latitude: 1, longitude: 2 },
        }}
        visibleLocations={['stationA']}
        addSite={() => {}}
        removeSite={() => {}}
        stationColors={{ stationA: '#123456' }}
      />,
    )
    expect(libre.Marker).toHaveBeenCalledTimes(1)
    expect(libre.Marker).toHaveBeenCalledWith({ color: '#123456' })
    expect(mockAddTo).toHaveBeenCalledTimes(1)
  })

  it('marker updated correctly', async () => {
    const visibleLocations = ['stationA']
    const { container } = render(
      <StationMap
        mapCenter={{ latitude: 1, longitude: 2 }}
        stations={{
          stationA: { name: 'stationA', latitude: 1, longitude: 2 },
        }}
        visibleLocations={visibleLocations}
        addSite={() => {}}
        removeSite={() => {}}
        stationColors={{ stationA: '#123456' }}
      />,
    )
    expect(libre.Marker).toHaveBeenCalledTimes(1)
    expect(libre.Marker).toHaveBeenCalledWith({ color: '#123456' })
    expect(mockAddTo).toHaveBeenCalledTimes(1)

    render(
      <StationMap
        mapCenter={{ latitude: 1, longitude: 2 }}
        stations={{
          stationA: { name: 'stationA', latitude: 1, longitude: 2 },
        }}
        visibleLocations={[]}
        addSite={() => {}}
        removeSite={() => {}}
        stationColors={{ stationA: '#123456' }}
      />,
      { container },
    )
    await waitFor(() => {
      expect(mockMarkerRemove).toHaveBeenCalledTimes(1)
      expect(libre.Marker).toHaveBeenCalledWith({
        color: 'grey',
        opacity: '0.5',
      })
    })
  })

  it('multiple markers created correctly', async () => {
    render(
      <StationMap
        mapCenter={{ latitude: 1, longitude: 2 }}
        stations={{
          stationA: { name: 'stationA', latitude: 1, longitude: 2 },
          stationB: { name: 'stationB', latitude: 3, longitude: 4 },
          stationC: { name: 'stationC', latitude: 5, longitude: 6 },
        }}
        visibleLocations={['stationA', 'stationB', 'stationC']}
        addSite={() => {}}
        removeSite={() => {}}
        stationColors={{
          stationA: '#123456',
          stationB: '#234567',
          stationC: '#345678',
        }}
      />,
    )
    expect(libre.Marker).toHaveBeenCalledTimes(3)
    expect(libre.Marker).toHaveBeenNthCalledWith(1, { color: '#123456' })
    expect(libre.Marker).toHaveBeenNthCalledWith(2, { color: '#234567' })
    expect(libre.Marker).toHaveBeenNthCalledWith(3, { color: '#345678' })
    expect(mockAddTo).toHaveBeenCalledTimes(3)
  })

  it('marker location set correctly', async () => {
    render(
      <StationMap
        mapCenter={{ latitude: 1, longitude: 2 }}
        stations={{
          stationA: { name: 'stationA', latitude: 1, longitude: 2 },
        }}
        visibleLocations={['']}
        addSite={() => {}}
        removeSite={() => {}}
        stationColors={{ stationA: '#123456' }}
      />,
    )
    expect(mockLngLat).toHaveBeenCalledTimes(1)
    expect(mockLngLat).toHaveBeenCalledWith([2, 1])
  })

  it('multiple markers location set', async () => {
    render(
      <StationMap
        mapCenter={{ latitude: 1, longitude: 2 }}
        stations={{
          stationA: { name: 'stationA', latitude: 1, longitude: 2 },
          stationB: { name: 'stationB', latitude: 3, longitude: 4 },
          stationC: { name: 'stationC', latitude: 5, longitude: 6 },
        }}
        visibleLocations={['stationA', 'stationB', 'stationC']}
        addSite={() => {}}
        removeSite={() => {}}
        stationColors={{
          stationA: '#123456',
          stationB: '#234567',
          stationC: '#345678',
        }}
      />,
    )
    expect(mockLngLat).toHaveBeenCalledTimes(3)
    expect(mockLngLat).toHaveBeenNthCalledWith(1, [2, 1])
    expect(mockLngLat).toHaveBeenNthCalledWith(2, [4, 3])
    expect(mockLngLat).toHaveBeenNthCalledWith(3, [6, 5])
  })
})
