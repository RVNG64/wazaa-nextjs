import React, { createContext, useContext, useState } from 'react';
import L from 'leaflet';

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
  fetchEventsInBounds: (bounds: L.LatLngBounds) => Promise<POI[]>;
  initializeEvents: (bounds: L.LatLngBounds) => Promise<void>;
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
/*
export const fetchEvents = async () => {
  try {
    const response = await fetch('https://storage.googleapis.com/wazaa/bddEvents.json');
    const data = await response.json();
    console.log(`Fetched ${data.length} events`);
    return data;
  } catch (error) {
    console.error("Erreur lors du chargement des événements", error);
    return [];
  }
};
*/

export const fetchEventsInBounds = async (bounds: L.LatLngBounds, category: string) => {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  try {
    const response = await fetch(
      `/api/events?ne=${ne.lat},${ne.lng}&sw=${sw.lat},${sw.lng}`
    );

    const textResponse = await response.text();
    console.log("Réponse brute: ", textResponse);

    // Vérifie si la réponse est ok (statut 200-299)
    if (!response.ok) {
      console.error("Erreur de réponse du serveur: ", response.status);
      throw new Error(`Erreur de serveur: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Réponse non JSON: ", response);
      throw new Error("Format de réponse non JSON");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors du chargement des événements", error);
    return [];
  }
};

export const fetchEventById = async (eventId: string) => {
  try {
    const response = await fetch(`/api/event/${eventId}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'événement');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    return null;
  }
};

export const EventsProvider: React.FC<EventsProviderProps> = ({ children, initialBounds }) => {
  const [events, setEvents] = useState<POI[]>([]);

  const fetchEventsInBounds = async (bounds: L.LatLngBounds) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    try {
      const response = await fetch(
        `/api/events?ne=${ne.lat},${ne.lng}&sw=${sw.lat},${sw.lng}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        });
        console.log("Réponse brute: ", response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur lors du chargement des événements", error);
      return [];
    }
  };

  const initializeEvents = async (bounds: L.LatLngBounds) => {
    const initialEvents = await fetchEventsInBounds(bounds);
    setEvents(initialEvents);
  };

  return (
    <EventsContext.Provider value={{ events, setEvents, fetchEventsInBounds, initializeEvents }}>
      {children}
    </EventsContext.Provider>
  );
};
