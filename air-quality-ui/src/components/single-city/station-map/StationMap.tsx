import {
  FullscreenControl,
  Map as MapMap,
  Marker,
  MarkerOptions,
  Popup,
} from 'maplibre-gl'
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
  stationColors: Record<string, string>
  removeSite: (siteName: string) => void
  addSite: (siteName: string) => void
}

const createPopup = (
  stationName: string,
  removeSite: (id: string) => void,
  addSite: (id: string) => void,
  remove: boolean = true,
) => {
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

  useEffect(() => {
    Object.values(stations).forEach((station) => {
      const marker = new Marker({ color: props.stationColors[station.name] })
      marker.setLngLat([station.longitude, station.latitude])
      marker.setPopup(createPopup(station.name, removeSite, addSite))
      marker.addTo(map.current!)

      markers.current?.set(station.name, marker)
    })
  }, [stations, props.stationColors, removeSite, addSite])

  const firstLoad = useRef<boolean>(true)

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }
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
      newMarker.setLngLat([marker.getLngLat().lng, marker.getLngLat().lat])
      newMarker.setPopup(createPopup(name, removeSite, addSite, remove))

      newMarker.addTo(map.current!)
      map.current
      markers.current?.set(name, newMarker)
    }

    for (const name of markers.current.keys()) {
      if (props.visibleLocations.includes(name)) {
        updateMarker(name, { color: props.stationColors[name] }, true)
      } else {
        updateMarker(name, { color: 'grey', opacity: '0.5' }, false)
      }
    }
  }, [props.visibleLocations, props.stationColors, removeSite, addSite])

  return <div ref={mapContainer} data-testid="map" className={classes['map']} />
}
