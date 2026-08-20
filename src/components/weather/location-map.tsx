'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

import type { WeatherLocation } from '@/lib/schemas';

/**
 * A CircleMarker is used instead of the default pin so the component never
 * depends on Leaflet's bundled marker PNGs — the original build patched
 * `L.Icon.Default` to point at a CDN, which broke the map whenever that CDN
 * was blocked.
 */

/** Re-centres when the user picks a new place, since `center` is initial-only. */
function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true });
  }, [lat, lon, map]);
  return null;
}

export default function LocationMap({ location }: { location: WeatherLocation }) {
  const position: L.LatLngExpression = [location.lat, location.lon];

  return (
    <MapContainer
      center={position}
      zoom={10}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
      aria-label={`Map showing ${location.name}`}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <CircleMarker
        center={position}
        radius={9}
        pathOptions={{
          color: '#ffffff',
          weight: 2,
          fillColor: '#3b66f6',
          fillOpacity: 0.9,
        }}
      >
        <Popup>
          <strong>{location.name}</strong>
          <br />
          {[location.region, location.country].filter(Boolean).join(', ')}
        </Popup>
      </CircleMarker>
      <Recenter lat={location.lat} lon={location.lon} />
    </MapContainer>
  );
}
