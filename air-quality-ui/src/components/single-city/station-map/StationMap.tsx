import maplibregl, { FullscreenControl, Marker, Popup } from 'maplibre-gl'
import { useEffect, useRef } from 'react'

import { createMapConfig } from './map-service'
import classes from './StationMap.module.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Coordinates } from '../../../services/types'

interface AverageComparisonChartProps {
  mapCenter: Coordinates
  locations: Map<string, { longitude: number; latitude: number }>
}

export const StationMap = (props: AverageComparisonChartProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const mapCenterLongitude = props.mapCenter.longitude
  const mapCenterLatitude = props.mapCenter.latitude
  const zoom = 9

  useEffect(() => {
    const mapconfig = new maplibregl.Map(
      createMapConfig(
        mapContainer.current!,
        mapCenterLatitude,
        mapCenterLongitude,
        zoom,
      ),
    )

    mapconfig.addControl(new FullscreenControl())

    props.locations.forEach((value, name) => {
      new Marker()
        .setLngLat([value.longitude, value.latitude])
        .setPopup(new Popup().setText(name))
        .addTo(mapconfig)
    })

    map.current = mapconfig
  }, [mapCenterLongitude, mapCenterLatitude, zoom, props.locations])

  return <div ref={mapContainer} data-testid="map" className={classes['map']} />
}
