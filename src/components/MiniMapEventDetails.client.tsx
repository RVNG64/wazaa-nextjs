import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MiniMapProps {
  lat: number;
  lng: number;
}

const miniMapMarker = new L.Icon({
  iconUrl: '/map-marker.svg',
  iconRetinaUrl: '/map-marker.svg',
  iconAnchor: [12, 55],
  popupAnchor: [-18, -44],
  iconSize: [25, 55],
  className: 'animated-mini-map-marker',
});

const MiniMap: React.FC<MiniMapProps> = ({ lat, lng }) => {
  const MapUpdater = () => {
    const map = useMap();
    map.setView([lat, lng]);
    return null;
  };

  return (
    <MapContainer center={[lat, lng]} zoom={14} scrollWheelZoom={false} className="mini-map">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={miniMapMarker}></Marker>
      <MapUpdater />
    </MapContainer>
  );
};

export default MiniMap;
