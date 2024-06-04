import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';
import L from 'leaflet';

export interface NativeEvent {
  eventID: string;
  name: string;
  organizerName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  photoUrl?: string;
  videoUrl?: string;
  description?: string;
  userOrganizer?: string;
  professionalOrganizer?: string;
  website?: string;
  ticketLink?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  audience?: string;
  location?: {
    address?: string;
    postalCode?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  accessibleForDisabled?: boolean;
  priceOptions?: {
    isFree: boolean;
    uniquePrice?: number;
    priceRange?: {
      min: number;
      max: number;
    };
  };
  acceptedPayments?: string[];
  capacity?: number;
  type: 'public' | 'private';
  validationStatus: 'pending' | 'approved' | 'rejected' | 'default';
  views: number;
  favoritesCount: number;
}

interface NativeEventContextProps {
  nativeEvents: NativeEvent[];
  setNativeEvents: React.Dispatch<React.SetStateAction<NativeEvent[]>>;
  fetchNativeEventsInBounds: (bounds: L.LatLngBounds) => Promise<NativeEvent[]>;
  initializeNativeEvents: (bounds: L.LatLngBounds) => Promise<void>;
}

interface NativeEventProviderProps {
  children: React.ReactNode;
  initialBounds?: L.LatLngBounds;
}

const NativeEventContext = createContext<NativeEventContextProps | null>(null);

export const useNativeEvents = () => {
  const context = useContext(NativeEventContext);
  if (!context) {
    throw new Error('useNativeEvents doit être utilisé au sein d’un NativeEventProvider');
  }
  return context;
};

export const fetchNativeEventsInBounds = async (bounds: L.LatLngBounds) => {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  try {
    const response = await api.get(
      `/api/native-events?neLat=${ne.lat}&neLng=${ne.lng}&swLat=${sw.lat}&swLng=${sw.lng}`
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des événements natifs', error);
    return [];
  }
}

export const fetchNativeEventsById = async (eventId: string) => {
  try {
    const response = await api.get(`/api/events/${eventId}`);
    if (!response.data) {
      throw new Error('Erreur lors de la récupération de l’événement natif');
    }
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l’événement natif', error);
    return null;
  }
};

export const NativeEventProvider: React.FC<NativeEventProviderProps> = ({ children, initialBounds }) => {
  const [nativeEvents, setNativeEvents] = useState<NativeEvent[]>([]);

  const fetchNativeEventsInBounds = async (bounds: L.LatLngBounds) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    try {
      const response = await api.get(
        `/api/native-events?ne=${ne.lat},${ne.lng}&sw=${sw.lat},${sw.lng}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );
      const data = response.data;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des événements natifs', error);
      return [];
    }
  };

  const initializeNativeEvents = async (bounds: L.LatLngBounds) => {
    const initialNativeEvents = await fetchNativeEventsInBounds(bounds);
    setNativeEvents(initialNativeEvents);
  };

  return (
    <NativeEventContext.Provider value={{ nativeEvents, setNativeEvents, fetchNativeEventsInBounds, initializeNativeEvents }}>
      {children}
    </NativeEventContext.Provider>
  );
};
