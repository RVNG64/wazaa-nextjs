/* import { useEffect } from 'react';
import { useMapEvents, useMap } from 'react-leaflet';
import { useEvents, POI } from '../EventContext';

const useSearchEvents = (setShowSearchButton: (val: boolean) => void, setEvents: (events: POI[]) => void, showSearchButton: boolean) => {
  const { fetchEventsInBounds } = useEvents();

  useMapEvents({
    moveend: () => setShowSearchButton(true),
    zoomend: () => setShowSearchButton(true)
  });

  useEffect(() => {
    if (showSearchButton) {
      const handleSearch = () => {
        const bounds = map.getBounds();
        fetchEventsInBounds(bounds).then(data => {
          setEvents(data);
          setShowSearchButton(false);
        });
      };

      handleSearch();
    }
  }, [showSearchButton, map, fetchEventsInBounds, setEvents]);

};

export default useSearchEvents;
*/

export {};
