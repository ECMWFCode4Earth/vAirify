import maplibregl, { FullscreenControl, Marker, Popup } from 'maplibre-gl'
import { useEffect, useRef } from 'react'

import { createMapConfig } from './map-service'
import classes from './StationMap.module.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Coordinates } from '../../../services/types'

export type Station = { name: string; latitude: number; longitude: number }

interface AverageComparisonChartProps {
  mapCenter: Coordinates
  stations: Record<string, Station>
  visibleLocations: string[]
}

export const StationMap = (props: AverageComparisonChartProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markers = useRef(new Map<string, Marker>())

  useEffect(() => {
    const zoom = 9
    const mapconfig = new maplibregl.Map(
      createMapConfig(
        mapContainer.current!,
        props.mapCenter.latitude,
        props.mapCenter.longitude,
        zoom,
      ),
    )

    mapconfig.addControl(new FullscreenControl())

    map.current = mapconfig
  }, [props.mapCenter.latitude, props.mapCenter.longitude])

  useEffect(() => {
    Object.values(props.stations).forEach((station) => {
      const marker = new Marker()
        .setLngLat([station.longitude, station.latitude])
        .setPopup(new Popup().setText(station.name))
        .addTo(map.current!)

      markers.current?.set(station.name, marker)
    })
  }, [props.stations])

  useEffect(() => {
    for (const name of markers.current.keys()) {
      if (props.visibleLocations.includes(name)) {
        markers.current.get(name)?.addTo(map.current!)
      } else {
        markers.current.get(name)?.remove()
      }
    }
  }, [props.visibleLocations])

  return <div ref={mapContainer} data-testid="map" className={classes['map']} />
}
