// src/contexts/EventContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import L from 'leaflet';
import dynamic from 'next/dynamic';

const LoadingAnimation = dynamic(() => import('../components/WazaaLoading'), { ssr: false });

export interface POI {
  '@id': string;
  'dc:identifier': string;
  'schema:endDate': string[];
  'schema:startDate': string[];
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
  'creationDate': string;
  'hasAudience': Audience[];
  'hasBeenCreatedBy': Agent;
  'hasBeenPublishedBy': Agent[];
  'hasBookingContact': Agent[];
  'hasContact': Agent[];
  'hasDescription': Description[];
  'hasGeographicReach': GeographicReach[];
  'hasMainRepresentation': EditorialObject[];
  'hasNeighborhood': SpatialEnvironmentTheme[];
  'hasRepresentation': EditorialObject[];
  'hasTheme': Theme[];
  'isLocatedAt': Place[];
  'isOwnedBy': Agent[];
  'lastUpdate': string;
  'lastUpdateDatatourisme': string;
  'offers': Offer[];
  'reducedMobilityAccess': boolean;
  'takesPlaceAt': Period[];
}

interface Audience {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

interface Agent {
  '@id': string;
  'dc:identifier': string;
  'schema:legalName': string;
  '@type': string[];
  'schema:email'?: string;
  'schema:telephone'?: string;
  'foaf:homepage'?: string;
}

interface Description {
  '@id': string;
  'dc:description': { [language: string]: string[] };
  '@type': string[];
}

interface GeographicReach {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

interface EditorialObject {
  '@id': string;
  'ebucore:hasRelatedResource': Resource[];
  'ebucore:title'?: { [language: string]: string[] };
  // Autres champs spécifiques à EditorialObject
}

interface SpatialEnvironmentTheme {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

export interface Theme {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

interface Place {
  '@id': string;
  'schema:address': PostalAddress[];
  'schema:geo': GeoCoordinates;
  '@type': string[];
}

interface PostalAddress {
  '@id': string;
  'schema:addressLocality': string;
  'schema:postalCode': string;
  'schema:streetAddress': string[];
  '@type': string[];
}

interface GeoCoordinates {
  '@id': string;
  'schema:latitude': string;
  'schema:longitude': string;
  '@type': string[];
}

interface Offer {
  '@id': string;
  'schema:acceptedPaymentMethod': PaymentMethod[];
  'schema:priceSpecification': PriceSpecification[];
  '@type': string[];
  'schema:description'?: { [language: string]: string[] };
}

interface Period {
  '@id': string;
  '@type': string[];
  'endDate': string;
  'startDate': string;
  'startTime'?: string;
  'endTime'?: string;
}

interface PaymentMethod {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

interface PriceSpecification {
  '@id': string;
  'schema:maxPrice'?: string;
  'schema:minPrice'?: string;
  'schema:priceCurrency': string;
  '@type': string[];
  'schema:value'?: string;
}

interface Resource {
  '@id': string;
  'ebucore:hasMimeType': MimeType[];
  'ebucore:locator': string;
  '@type': string[];
}

interface MimeType {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

interface EventsContextProps {
  events: POI[];
  setEvents: React.Dispatch<React.SetStateAction<POI[]>>;
  fetchEventsInBounds: (bounds: L.LatLngBounds, startDate?: string, endDate?: string) => Promise<POI[]>;
  initializeEvents: (bounds?: L.LatLngBounds, startDate?: string, endDate?: string) => Promise<void>;
  fetchAllEvents: () => Promise<POI[]>;
  isLoading?: boolean;
}

interface EventsProviderProps {
  children: React.ReactNode;
  initialBounds?: L.LatLngBounds;
}

const EventsContext = createContext<EventsContextProps | null>(null);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents doit être utilisé au sein d\'un EventsProvider');
  }
  return context;
};

const fetchEventsInBounds = async (bounds: L.LatLngBounds, startDate?: string, endDate?: string) => {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  try {
    const url = new URL('/api/events', window.location.origin);
    url.searchParams.append('ne', `${ne.lat},${ne.lng}`);
    url.searchParams.append('sw', `${sw.lat},${sw.lng}`);
    if (startDate) url.searchParams.append('startDate', startDate);
    if (endDate) url.searchParams.append('endDate', endDate);

    const response = await api.get(url.toString());

    if (response.status !== 200) {
      console.error("Erreur de réponse du serveur: ", response.status);
      throw new Error(`Erreur de serveur: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des événements", error);
    return [];
  }
};

export const fetchEventById = async (eventId: string) => {
  console.log(`Fetching event with id: ${eventId}`);
  try {
    const response = await api.get(`/api/event/${eventId}`);
    if (response.status !== 200) {
      throw new Error('Erreur lors de la récupération de l\'événement');
    }
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    return null;
  }
};

const fetchAllEvents = async () => {
  try {
    const response = await api.get('/api/cache/events');
    if (response.status !== 200) {
      throw new Error('Erreur lors de la récupération des événements depuis le cache');
    }
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des événements depuis le cache", error);
    return [];
  }
};

export const EventsProvider: React.FC<EventsProviderProps> = ({ children, initialBounds }) => {
  const [events, setEvents] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initializeEvents = useCallback(async (bounds?: L.LatLngBounds, startDate?: string, endDate?: string) => {
    console.log(`Initializing events with dates: startDate=${startDate}, endDate=${endDate}`);

    setIsLoading(true);
    if (bounds) {
      const initialEvents = await fetchEventsInBounds(bounds, startDate, endDate);
      setEvents(initialEvents);
    } else {
      console.error('No bounds provided for initializing events');
      //const allEvents = await fetchAllEvents();
      //setEvents(allEvents);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Initialisation automatique des événements lors du montage du composant
    initializeEvents(initialBounds).catch(error => {
      console.error('Erreur lors de l\'initialisation des événements:', error);
      setIsLoading(false);
    });
  }, [initialBounds, initializeEvents]);

  return (
    <EventsContext.Provider value={{ events, setEvents, fetchEventsInBounds, initializeEvents, fetchAllEvents }}>
      {children}
      <LoadingAnimation isLoading={isLoading} />
    </EventsContext.Provider>
  );
};
