import { MapOptions, RasterSourceSpecification, StyleSpecification } from 'maplibre-gl'
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

  it('is correctly attributed', () => {
    const mapConfig = createMapConfig('id', 1, 2, 3)
    expect(getRasterSource(mapConfig).attribution).toContain(
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    )
  })

  it('is uses correct tiles', () => {
    const mapConfig = createMapConfig('id', 1, 2, 3)
    expect(getRasterSource(mapConfig).tiles).toContain(
      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
    )
  })

  it('has osm layer set', () => {
    const mapConfig = createMapConfig('id', 1, 2, 3)
    expect(
      (mapConfig.style as StyleSpecification).layers.find(
        (layer) => layer.id == 'osm',
      ),
    ).toBeDefined()
  })
})

const getRasterSource = (mapConfig: MapOptions): RasterSourceSpecification => {
  const sources = (mapConfig.style as StyleSpecification).sources
  return sources.osm as RasterSourceSpecification
}
