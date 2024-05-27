// src/app/mes-evenements/participants/[eventId].tsx
/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Image = dynamic(() => import('next/image'), { ssr: false });

interface Participant {
  firebaseId: string;
  profilePicture: string;
  firstName: string;
  lastName: string;
  status: string;
}

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

const AttendanceEventsAdmin: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sortKey, setSortKey] = useState('firstName' || 'lastName' || 'status');
  const [filterStatus, setFilterStatus] = useState('All' || 'Participating' || 'Maybe' || 'Not Participating');
  // const [searchTerm, ] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showShareConfirmation, setShowShareConfirmation] = useState(false);
  // const [, setSearchResults] = useState([]);
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId;

  // Mettre à jour l'événement sélectionné lorsqu'il est modifié
  useEffect(() => {
    if (eventId) {
      // Appel API pour obtenir les détails de l'événement
      const fetchEventDetails = async () => {
        try {
          const response = await axios.get(`/api/events/${eventId}`);
          setSelectedEvent(response.data);
        } catch (error) {
          console.error('Erreur lors du chargement des détails de l’événement', error);
        }
      };
      fetchEventDetails();
    }
  }, [eventId]);

  // Mettre à jour la liste des participants lorsqu'un événement est sélectionné
  useEffect(() => {
    if (selectedEvent) {
      // Récupérer la liste des participants
      const fetchParticipants = async () => {
        try {
          const response = await axios.get(`/api/events/${selectedEvent.eventID}/participants`);
          if (response.data) {
            console.log('Participants', response.data);
            setParticipants(response.data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des participants', error);
        }
      };
      fetchParticipants();
    }
  }, [selectedEvent]);

  /* Fonction pour rechercher des utilisateurs
  const handleSearch = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/search?term=${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Erreur lors de la recherche', error);
    }
  };

  // Fonction pour envoyer des invitations
  const handleSendInvitations = async (userIds: string[]) => {
    try {
      if (selectedEvent) {
        await axios.post(`${process.env.REACT_APP_API_URL}/events/${selectedEvent.eventID}/sendInvitations`, { userIds });
        // Gérer la réponse - par exemple, montrer un message de succès
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des invitations', error);
    }
  }; */

  const getSortedParticipants = () => {
    return [...participants].sort((a, b) => {
      if (sortKey in a && sortKey in b) {
        return (a[sortKey as keyof Participant] as string).localeCompare(b[sortKey as keyof Participant] as string);
      }
      return 0;
    });
  };

  const getFilteredParticipants = () => {
    const sorted = getSortedParticipants();
    return sorted.filter((participant) => filterStatus === 'All' || participant.status === filterStatus);
  };
  const filteredParticipants = getFilteredParticipants();

  const handleDeleteParticipant = async (firebaseId: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Cette action est irréversible!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!'
    });

    if (result.isConfirmed) {
      try {
        if (selectedEvent) {
          const response = await axios.delete(`${process.env.REACT_APP_API_URL}/events/${selectedEvent.eventID}/participants/${firebaseId}`);
          if (response.status === 200) {
            setParticipants(prevParticipants => prevParticipants.filter(participant => participant.firebaseId !== firebaseId));
            Swal.fire(
              'Supprimé!',
              'Le participant a été supprimé.',
              'success'
            );
          }
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du participant', error);
        Swal.fire(
          'Erreur!',
          'Une erreur est survenue lors de la suppression.',
          'error'
        );
      }
    }
  };

  const handleBlockParticipant = async (firebaseId: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Voulez-vous vraiment bloquer ce participant?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, bloquer!'
    });

    if (result.isConfirmed) {
      try {
        if (selectedEvent) {
          const response = await axios.put(`${process.env.REACT_APP_API_URL}/events/${selectedEvent.eventID}/participants/${firebaseId}/block`);
          if (response.status === 200) {
            setParticipants(prevParticipants => prevParticipants.map(participant => {
              if (participant.firebaseId === firebaseId) {
                return { ...participant, status: 'Blocked' };
              }
              return participant;
            }));
            Swal.fire(
              'Bloqué!',
              'Le participant a été bloqué.',
              'success'
            );
          }
        }
      } catch (error) {
        console.error('Erreur lors du blocage du participant', error);
        Swal.fire(
          'Erreur!',
          'Une erreur est survenue lors du blocage.',
          'error'
        );
      }
    }
  };
/*
  const createShareLink = () => {
    if (selectedEvent) {
      return `http://yourapp.com/event/${selectedEvent.eventID}/invitation`;
    }
    return '';
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Vous êtes invité à un événement!");
    const body = encodeURIComponent(`Rejoignez-nous à l'événement: ${createShareLink()}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }; */

  const shareOnSocialMedia = (platform: string) => {
    const eventUrl = window.location.href;
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${eventUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${eventUrl}`;
        break;
      case 'whatsapp':
        url = `whatsapp://send?text=${eventUrl}`;
        break;
    }

    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    const eventUrl = window.location.href;
    navigator.clipboard.writeText(eventUrl)
      .then(() => {
        setShowShareConfirmation(true);
        setTimeout(() => setShowShareConfirmation(false), 3000);
      })
      .catch(err => console.error("Impossible de copier le lien", err));
  };

  // Fonction pour partager l'événement
  const shareEvent = () => {
    setShowSharePopup(true);
  };

  const translateStatusToFrench = (status: string) => {
    const statusTranslations: { [key: string]: string } = {
      'Participating': 'Participe',
      'Maybe': 'Peut-être',
      'Not Participating': 'Absent',
    };

    return statusTranslations[status as keyof typeof statusTranslations] || status;
  };

  const backToEventList = () => {
    window.location.href = '/mes-evenements';
  }

  const popupShareVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };

  return (
    <div className="attendance-events-admin__container">
      <h2 className='attendance-events-admin__title'>Administration de <i>"{selectedEvent?.name}"</i></h2>
      {/* <div className="attendance-events-admin__select">
        <label htmlFor="event-select" className="attendance-events-admin__label-select">Sélectionner un événement :</label>
        <select
          id="event-select"
          className="attendance-events-admin__select"
          onChange={(e) => {
            const newSelectedEvent = nativeEvents.find(event => event.eventID === e.target.value);
            setSelectedEvent(newSelectedEvent ?? null);
          }}
        >
          {nativeEvents.map((event) => (
            <option key={event.eventID} value={event.eventID} className="attendance-events-admin__select-option">
              {event.name}
            </option>
          ))}
        </select>
      </div>
      Bouton menant à la page de l'événement dans un nouvel onglet
      <a href={`/events/${selectedEvent.eventID}`} target="_blank" rel="noopener noreferrer" className="attendance-events-admin__event-button">
        Voir l'Événement
      </a>

      <h3 className="attendance-events-admin__attendance-title">Participants</h3> */}

      <div className="attendance-events-admin__share-title">
        Partager l'événement
        <button onClick={shareEvent} className="popup-details_share-btn">
          <i className="fas fa-share-alt"></i> {/* Icône pour partager */}
        </button>
      </div>
      {showSharePopup && (
        <>
          <motion.div
            className="popup-details_share-overlay"
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setShowSharePopup(false)}
          ></motion.div>
          <motion.div
            className="popup-details_share-popup"
            variants={popupShareVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button className="popup-details_close-share-btn" onClick={() => setShowSharePopup(false)}>
              <i className="fas fa-times"></i> {/* Icône de croix */}
            </button>
            <button onClick={() => shareOnSocialMedia('facebook')} className="popup-details_social-share-btn">
              <Image src="/icon-facebook.svg" alt="Facebook" width={40} height={40} />
            </button>
            <button onClick={() => shareOnSocialMedia('twitter')} className="popup-details_social-share-btn">
              <Image src="/icon-twitter.svg" alt="Twitter" width={40} height={40} />
            </button>
            <button onClick={() => shareOnSocialMedia('whatsapp')} className="popup-details_social-share-btn">
              <Image src="/icon-whatsapp.svg" alt="WhatsApp" width={40} height={40} />
            </button>
            <button onClick={copyToClipboard} className="popup-details_social-share-btn">
              <i className="fas fa-copy"></i>  Copier le lien
            </button>
            {showShareConfirmation && <div className="popup-details_confirmation-message">Lien de l'événement copié !</div>}
          </motion.div>
        </>
      )}

      <button onClick={backToEventList} className="attendance-events-admin__back-button">
        <i className="fas fa-arrow-left"></i> Retour
      </button>

      <div className="attendance-events-admin__filters">
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
          <option value="firstName" className="attendance-events-admin__option">Prénom</option>
          <option value="lastName" className="attendance-events-admin__option">Nom</option>
          <option value="status" className="attendance-events-admin__option">Status</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">Tous</option>
          <option value="Participating">Participe</option>
          <option value="Maybe">Peut-être</option>
          <option value="Not Participating">Absent</option>
        </select>
      </div>

      <table className="attendance-events-admin__attendance-table">
        <thead className="attendance-events-admin__attendance-table-head">
          <tr className="attendance-events-admin__attendance-table-row">
            <th className="attendance-events-admin__attendance-table-header">Photo</th>
            <th className="attendance-events-admin__attendance-table-header">Prénom</th>
            <th className="attendance-events-admin__attendance-table-header">Nom</th>
            <th className="attendance-events-admin__attendance-table-header">Status</th>
            <th className="attendance-events-admin__attendance-table-header">Actions</th>
          </tr>
        </thead>
        <tbody className="attendance-events-admin__attendance-table-body">
          {filteredParticipants.map((participant, index) => (
            <tr key={index} className="attendance-events-admin__attendance-table-row">
              <td className="attendance-events-admin__attendance-table-data">
                <Image
                  src={participant.profilePicture}
                  alt={`${participant.firstName} ${participant.lastName}`}
                  className="attendance-events-admin__attendance-table-image"
                  width={40}
                  height={40}
                />
              </td>
              <td className="attendance-events-admin__attendance-table-data">{participant.firstName}</td>
              <td className="attendance-events-admin__attendance-table-data">{participant.lastName}</td>
              <td className="attendance-events-admin__attendance-table-data">{translateStatusToFrench(participant.status)}</td>
              <td className="attendance-events-admin__actions">
                <button onClick={() => handleDeleteParticipant(participant.firebaseId)} className="attendance-events-admin__delete-button">Supprimer</button>
                <button onClick={() => handleBlockParticipant(participant.firebaseId)} className="attendance-events-admin__block-button">Bloquer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceEventsAdmin;
