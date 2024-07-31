import { MapOptions } from 'maplibre-gl'

export const createMapConfig = (
  container: string | HTMLElement,
  latitude: number,
  longitude: number,
  zoom: number,
): MapOptions => {
  return {
    container,
    style: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
        },
      ],
    },
    center: [longitude, latitude],
    zoom,
  }
}
