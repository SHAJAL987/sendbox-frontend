'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

export default function Map({ lat, lon }) {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet-assets/marker-icon-2x.png',
      iconUrl: '/leaflet-assets/marker-icon.png',
      shadowUrl: '/leaflet-assets/marker-shadow.png',
    });
  }, []);

  return (
    <MapContainer
      center={[lat, lon]}
      zoom={8}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <Marker position={[lat, lon]}>
        <Popup>📍 You are here</Popup>
      </Marker>
    </MapContainer>
  );
}
