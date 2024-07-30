import maplibregl, { Marker } from 'maplibre-gl'
import { useEffect, useRef } from 'react'

import classes from './StationMap.module.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ForecastResponseDto } from '../../../services/types'

interface AverageComparisonChartProps {
  forecastData: ForecastResponseDto[]
  locations: Map<string, { longitude: number; latitude: number }>
}

export const StationMap = (props: AverageComparisonChartProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const city_longitude = props.forecastData[0].coordinates.longitude
  const city_latitude = props.forecastData[0].coordinates.latitude
  const zoom = 9

  useEffect(() => {
    const mapconfig = new maplibregl.Map({
      container: mapContainer.current!,
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
      center: [city_longitude, city_latitude],
      zoom,
    })

    mapconfig.addControl(new maplibregl.FullscreenControl())

    props.locations.forEach((value) => {
      new Marker({ color: 'blue' })
        .setLngLat([value.longitude, value.latitude])
        .addTo(mapconfig)
    })

    map.current = mapconfig
  }, [city_longitude, city_latitude, zoom, props.locations])

  return <div ref={mapContainer} className={classes['map']} />
}
