import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

import classes from './SiteMap.module.css'

export interface SiteOnMap {
  latitude: number
  longitude: number
  name: string
  selected: boolean
}

export interface SiteMapProps {
  latitude: number
  longitude: number
  sites: SiteOnMap[]
}

export const SiteMap = ({
  latitude,
  longitude,
  sites,
}: SiteMapProps): JSX.Element => {
  return (
    <MapContainer
      className={classes['map-container']}
      center={[latitude, longitude]}
      zoom={10}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sites.map(({ name, latitude, longitude, selected }) => (
        <Marker
          key={`${name}_marker`}
          position={[latitude, longitude]}
          opacity={selected ? 1 : 0.5}
        >
          <Popup>{name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
