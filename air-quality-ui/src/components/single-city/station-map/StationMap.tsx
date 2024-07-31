import maplibregl, { Marker } from 'maplibre-gl'
import { useEffect, useRef } from 'react'

import { createMapConfig } from './map-service'
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
    const mapconfig = new maplibregl.Map(
      createMapConfig(
        mapContainer.current!,
        city_latitude,
        city_longitude,
        zoom,
      ),
    )

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
