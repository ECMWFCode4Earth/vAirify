import { createMapConfig } from './map-service'

describe('map config', () => {
  it('has a zoom level specified', () => {
    const zoom = 5
    const mapConfig = createMapConfig('id', 1, 2, zoom)
    expect(mapConfig.zoom).toBe(zoom)
  })

  it('has the latitude correct', () => {
    const latitude = 51.12
    const longitude = -0.08
    const mapConfig = createMapConfig('id', latitude, longitude, 3)
    expect(mapConfig.center).toEqual([longitude, latitude])
  })

  it('uses the container', () => {
    const mapConfig = createMapConfig('id', 1, 2, 3)
    expect(mapConfig.container).toBe('id')
  })
})
