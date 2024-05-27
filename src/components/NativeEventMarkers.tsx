// src/components/NativeEventMarkers.tsx
import React from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { NativeEvent } from '../contexts/NativeEventContext';
import dynamic from 'next/dynamic';

const Image = dynamic(() => import('next/image'), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const mapMarker = new L.Icon({
  iconUrl: '/map-marker.svg',
  iconRetinaUrl: '/map-marker.svg',
  iconAnchor: [12, 55],
  popupAnchor: [-18, -40],
  iconSize: [25, 55],
  className: 'map-marker'
});

interface NativeEventMarkersProps {
  filteredNativeEvents: NativeEvent[];
  handleNativeMarkerClick: (event: NativeEvent) => void;
  centerMapOnNativeMarker: (event: NativeEvent) => void;
}

const NativeEventMarkers: React.FC<NativeEventMarkersProps> = React.memo(({ filteredNativeEvents, handleNativeMarkerClick, centerMapOnNativeMarker }) => {
  // Formatage de la date en format français
  const frenchFormatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const cardVariants = {
    hidden: { y: 300 },
    visible: { y: 0 }
  };

  return (
    <>
      {filteredNativeEvents.map((event, index) => {
        if (event.location && event.location.latitude && event.location.longitude) {
          const { latitude, longitude } = event.location;
          const formattedStartDate = frenchFormatDate(event.startDate);
          const formattedEndDate = frenchFormatDate(event.endDate);
          const displayDate = formattedStartDate === formattedEndDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}`;
          const defaultImageUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
          const poster = event.photoUrl || defaultImageUrl;
          const posterUrl = Array.isArray(poster) ? poster[0] : poster;
          const description = event.description || '';

          return (
            <Marker
              key={`${event.eventID}-${index}`}
              position={[latitude, longitude]}
              eventHandlers={{
                click: () => centerMapOnNativeMarker(event),
              }}
              icon={mapMarker}
            >
              <Popup className='leaflet-popup-container'>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={cardVariants}
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                  className="custom-popup-container"
                  onClick={() => handleNativeMarkerClick(event)}
                >
                  <div className="custom-popup-image-container">
                    <Image
                      src={posterUrl}
                      alt={event.name}
                      width={240}
                      height={270}
                      className="custom-popup-image"
                    />
                  </div>
                  <div className="custom-popup-content">
                    <h2 className="custom-popup-title">{event.name}</h2>
                    <p className="custom-popup-description">
                      {description}
                    </p>
                    <p className="custom-popup-address">
                      {event.location.address || 'Adresse inconnue'}, {event.location.postalCode} {event.location.city}
                    </p>
                    <p className="custom-popup-date">
                      {displayDate}
                    </p>
                    <button className="custom-view-more-button">
                      Voir plus
                    </button>
                  </div>
                </motion.div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </>
  );
});

NativeEventMarkers.displayName = 'NativeEventMarkers';

export default NativeEventMarkers;
