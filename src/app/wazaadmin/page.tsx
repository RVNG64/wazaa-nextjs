// src/app/wazaadmin/page.tsx
'use client';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { AuthContext } from '../../contexts/AuthProvider.client';
import Swal from 'sweetalert2';

const NativeEventDetailsPopup = dynamic(() => import('../../components/NativeEventDetailsPopup'), { ssr: false });

interface Event {
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

const AdminEvents = () => {
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [showPreviewValidation, setShowPreviewValidation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { currentUser, loading } = useContext(AuthContext);
  const router = useRouter();

  const navigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      router.push(path);
    }
  }, [router]);

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        navigate('/connexion');
      } else if (currentUser?.uid !== 'oqrJOhstj8dHwf13mNp6TIYbLAj1') {
        navigate('/');
      }
    }
  }, [currentUser, loading, navigate]);

  const fetchPendingEvents = async () => {
    try {
      console.log('Fetching pending events...');
      const response = await axios.get('/api/events/updateStatus'); // Mise à jour du chemin API
      console.log('Pending events fetched:', response.data);
      setPendingEvents(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements en attente', error);
    }
  };

  useEffect(() => {
    if (!loading && currentUser?.uid === 'oqrJOhstj8dHwf13mNp6TIYbLAj1') {
      fetchPendingEvents();
    }
  }, [loading, currentUser]);

  const handleStatusChange = async (eventId: string, newStatus: 'approved' | 'rejected') => {
    const action = newStatus === 'approved' ? 'approuver' : 'rejeter';

    if (typeof window !== 'undefined') {
      Swal.fire({
        title: `Êtes-vous sûr de vouloir ${action} cet événement ?`,
        showDenyButton: true,
        confirmButtonText: `Oui, ${action}`,
        denyButtonText: `Non, annuler`,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.put(`/api/events/updateStatus?eventId=${eventId}`, { validationStatus: newStatus }); // Mise à jour du chemin API
            fetchPendingEvents(); // Recharger la liste après la mise à jour
            Swal.fire('Mis à jour!', `L'événement a été ${action} avec succès.`, 'success');
          } catch (error) {
            console.error('Erreur lors de la mise à jour du statut de l\'événement', error);
            Swal.fire('Erreur', 'Une erreur est survenue lors de la mise à jour.', 'error');
          }
        }
      });
    }
  };

  const handlePreviewValidation = (event: Event) => {
    if (typeof window !== 'undefined') {
      console.log('Aperçu de l\'événement : ', event);
      setSelectedEvent(event);
      setShowPreviewValidation(true);
    }
  };

  return (
    <div className="admin-events-container">
      <h2 className="admin-events-validation_title">Administration des Événements</h2>
      <div className="admin-events-cards-container">
        {pendingEvents.length > 0 ? (
          pendingEvents.map((event) => (
            <div className="admin-events-validation_card" key={event.eventID}>
              <div className="admin-events-validation_info">
                <p className="admin-events-validation_name">{event.name}</p>
                <p className="admin-events-validation_organizer">Organisé par : {event.organizerName}</p>
              </div>
              <div className="admin-events-validation_validation-buttons">
                <button className="admin-events-validation_approve-btn" onClick={() => handleStatusChange(event.eventID, 'approved')}>
                  <i className="fa fa-check"></i> Approuver
                </button>
                <button className="admin-events-validation_reject-btn" onClick={() => handleStatusChange(event.eventID, 'rejected')}>
                  <i className="fa fa-times"></i> Rejeter
                </button>
                <button className="admin-events-validation_preview-btn" onClick={() => handlePreviewValidation(event)}>
                  <i className="fa fa-eye"></i> Aperçu
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Aucun événement en attente.</p>
        )}
      </div>
      {showPreviewValidation && selectedEvent && <NativeEventDetailsPopup eventData={selectedEvent} isPreview={showPreviewValidation} onClose={() => setShowPreviewValidation(false)} />}
    </div>
  );
};

export default AdminEvents;
