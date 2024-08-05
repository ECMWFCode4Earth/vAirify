import {
  FullscreenControl,
  Map as MapMap,
  Marker,
  MarkerOptions,
  Popup,
} from 'maplibre-gl'
import { useCallback, useEffect, useRef } from 'react'
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
  stationColors: Record<string, string>
  removeSite: (siteName: string) => void
  addSite: (siteName: string) => void
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

  const { stations, removeSite, addSite } = props

  const createPopup = useCallback(
    (stationName: string, remove: boolean = true) => {
      const div = document.createElement('div')
      const root = createRoot(div)
      root.render(
        <StationPopup
          stationName={stationName}
          removeSite={(id) => removeSite(id)}
          addSite={(id) => addSite(id)}
          remove={remove}
        />,
      )
      return new Popup().setDOMContent(div)
    },
    [addSite, removeSite],
  )

  useEffect(() => {
    Object.values(stations).forEach((station) => {
      const marker = new Marker({ color: props.stationColors[station.name] })
        .setLngLat([station.longitude, station.latitude])
        .setPopup(createPopup(station.name))
        .addTo(map.current!)

      markers.current?.set(station.name, marker)
    })
  }, [stations, createPopup, props.stationColors])

  useEffect(() => {
    const updateMarker = (
      name: string,
      markerOptions: MarkerOptions,
      remove: boolean,
    ) => {
      const marker = markers.current.get(name)!
      if (marker._color === markerOptions.color) {
        return
      }
      marker.remove()
      const newMarker = new Marker(markerOptions)
        .setLngLat([marker._lngLat.lng, marker._lngLat.lat])
        .setPopup(createPopup(name, remove))

      newMarker.addTo(map.current!)
      markers.current?.set(name, newMarker)
    }

    for (const name of markers.current.keys()) {
      if (props.visibleLocations.includes(name)) {
        updateMarker(name, { color: props.stationColors[name] }, true)
      } else {
        updateMarker(name, { color: 'grey', opacity: '0.5' }, false)
      }
    }
  }, [props.visibleLocations, createPopup, props.stationColors])

  return <div ref={mapContainer} data-testid="map" className={classes['map']} />
}
