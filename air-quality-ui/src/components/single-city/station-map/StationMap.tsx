import { FullscreenControl, Map as MapMap, Marker, Popup } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import { createMapConfig } from './map-service'
import classes from './StationMap.module.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { StationPopup } from './StationPopup'
import { Coordinates } from '../../../services/types'

export type Station = { name: string; latitude: number; longitude: number }

interface AverageComparisonChartProps {
  mapCenter: Coordinates
  stations: Record<string, Station>
  visibleLocations: string[]
  removeSite: (siteName: string) => void
}

export const StationMap = (props: AverageComparisonChartProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<MapMap | null>(null)
  const markers = useRef(new Map<string, Marker>())

  useEffect(() => {
    const zoom = 9
    const mapconfig = new MapMap(
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

  const { stations, removeSite } = props

  useEffect(() => {
    const createPopup = (stationName: string) => {
      const div = document.createElement('div')
      const root = createRoot(div)
      root.render(
        <StationPopup
          title={stationName}
          removeSite={(id) => removeSite(id)}
        />,
      )
      return new Popup().setDOMContent(div)
    }

    Object.values(stations).forEach((station) => {
      const marker = new Marker()
        .setLngLat([station.longitude, station.latitude])
        .setPopup(createPopup(station.name))
        .addTo(map.current!)

      markers.current?.set(station.name, marker)
    })
  }, [stations, removeSite])

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
