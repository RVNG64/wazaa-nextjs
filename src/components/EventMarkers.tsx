// src/components/EventMarkers.tsx
import React from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { POI } from '../contexts/EventContext';
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

interface EventMarkersProps {
  poisFiltres: POI[];
  handleMarkerClick: (poi: POI) => void;
  centerMapOnMarker: (poi: POI) => void;
}

const EventMarkers: React.FC<EventMarkersProps> = React.memo(({ poisFiltres, handleMarkerClick, centerMapOnMarker }) => {
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
      {poisFiltres.map((poi, index) => {
        const latitude = parseFloat(poi['isLocatedAt'][0]['schema:geo']['schema:latitude']);
        const longitude = parseFloat(poi['isLocatedAt'][0]['schema:geo']['schema:longitude']);
        const defaultImageUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
        const poster = poi['hasMainRepresentation']?.[0]?.['ebucore:hasRelatedResource']?.[0]?.['ebucore:locator'] || defaultImageUrl;
        const posterUrl = Array.isArray(poster) ? poster[0] : poster;

        let displayDescription = poi['hasDescription']?.[0]?.['dc:description']?.fr?.[0] || '';
        const DESCRIPTION_LIMIT = 100;
        if (displayDescription.length > DESCRIPTION_LIMIT) {
          displayDescription = displayDescription.substring(0, DESCRIPTION_LIMIT) + '...';
        }
        const formattedStartDate = frenchFormatDate(poi['schema:startDate']?.[0]);
        const formattedEndDate = frenchFormatDate(poi['schema:endDate']?.[0]);

        const isSameDate = poi['schema:startDate']?.[0] === poi['schema:endDate']?.[0];
        const displayDate = isSameDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}`;

        if (!isNaN(latitude) && !isNaN(longitude)) {
          return (
            <Marker
              key={`${poi['@id']}-${index}`}
              eventHandlers={{
                click: () => centerMapOnMarker(poi),
              }}
              position={[latitude, longitude]}
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
                  onClick={() => handleMarkerClick(poi)}
                >
                  <div className="custom-popup-image-container">
                    <Image
                      src={posterUrl}
                      alt={poi['rdfs:label']['fr'][0]}
                      width={240}
                      height={270}
                      className="custom-popup-image"
                    />
                  </div>
                  <div className="custom-popup-content">
                    <h2 className="custom-popup-title">{poi['rdfs:label']['fr'][0]}</h2>
                    <p className="custom-popup-description">
                      {displayDescription}
                    </p>
                    <div className="custom-popup_infos">
                      <div className="custom-popup-info-item">
                        <i className="fas fa-map-marker-alt custom-popup-icon"></i>
                        <p className="custom-popup-address">
                          {poi['isLocatedAt']?.[0]?.['schema:address']?.[0]?.['schema:addressLocality'] || 'Localité inconnue'}
                        </p>
                      </div>
                      <div className="custom-popup-info-item">
                        <i className="fas fa-calendar-alt custom-popup-icon"></i>
                        <p className="custom-popup-date">
                          {displayDate}
                        </p>
                      </div>
                    </div>
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

EventMarkers.displayName = 'EventMarkers';

export default EventMarkers;
