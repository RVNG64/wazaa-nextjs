// src/app/creation-evenement/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../utils/firebase';
import axios from 'axios';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'flatpickr/dist/themes/light.css';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';

const Flatpickr = dynamic(() => import('react-flatpickr'), { ssr: false });
const FontAwesomeIcon = dynamic(() => import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon), { ssr: false });

const EventCreationForm = () => {
  const categories = ["Musique", "Art", "Sport", "Festival", "Vie nocturne", "Éducation", "Théâtre", "Tourisme", "Business", "Gastronomie", "Famille/Amis", "Pour les petits", "Divertissement", "Social", "Autre"];
  const [showTooltip, setShowTooltip] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(true);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    const fetchUserType = async () => {
      if (auth.currentUser) {
        try {
          const response = await axios.get(`/api/users/${auth.currentUser.uid}`);
          if (response.data) {
            setIsOrganizer(response.data.type === 'organizer');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil utilisateur:', error);
        }
      }
    };

    fetchUserType();
  }, []); // Exécuté une seule fois au montage du composant

  const toggleTooltip = (type: string) => {
    setShowTooltip(showTooltip === type ? '' : type);
  };

  const formatDate = (date: Date | string) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() est indexé à 0
    let year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const formatTime = (date: Date | string) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  // Les données de l'événement sont stockées dans un objet
  const [eventData, setEventData] = useState({
    isPublic: false,
    name: '',
    startDate: new Date(),
    endDate: null as Date | null,
    startTime: '',
    endTime: '',
    category: ''
  });

  // Options pour le composant Flatpickr
  const flatpickrOptions = {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    locale: French,
    time_24hr: true
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Données de l\'événement:', eventData);

    // Vérification des données soumises
    if (!eventData.name || !eventData.startDate || !eventData.startTime || !eventData.endTime || !eventData.category) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      setShowError(true); // Ajoutez cette ligne pour déclencher l'affichage de l'erreur
      setTimeout(() => {
        setErrorMessage('');
        setShowError(false); // Masquez le message après un certain temps
      }, 3000);
      return;
    }

    const eventCreatedData = {
      name: eventData.name,
      startDate: formatDate(eventData.startDate),
      endDate: eventData.endDate ? formatDate(eventData.endDate) : formatDate(eventData.startDate),
      startTime: formatTime(eventData.startTime),
      endTime: formatTime(eventData.endTime),
      category: eventData.category,
      type: eventData.isPublic ? 'public' : 'private',
      userID: auth.currentUser ? auth.currentUser.uid : null
    };

    try {
      console.log('Données avant POST:', eventCreatedData);
      const response = await axios.post(`/api/organized/events/create`, eventCreatedData);
      console.log('Événement créé:', response.data);
      navigate('/mes-evenements');
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      // Gérer l'erreur dans l'UI
      setErrorMessage('Erreur lors de la création de l\'événement. Veuillez réessayer.');
    }
  };

  const handleToggleClick = () => {
    if (!isOrganizer) {
      setErrorMessage("Seuls les organisateurs peuvent créer des événements publics.");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      // Ajoute temporairement la classe de vibration
      const toggle = document.querySelector('.event-creation_toggle');
      if (toggle) { // S'assurer que l'élément existe
        toggle.classList.add('event-creation_vibrate');
        setTimeout(() => {
          if (toggle) { // Vérifier à nouveau car l'élément pourrait avoir été démonté
            toggle.classList.remove('event-creation_vibrate');
          }
        }, 500);
      }
    } else {
      setErrorMessage('');
      setEventData(prevState => ({ ...prevState, isPublic: !prevState.isPublic }));
    }
  };

  const handleEndDateToggle = () => {
    setShowEndDate(!showEndDate);
    setEventData(prevEventData => ({
      ...prevEventData,
      endDate: !showEndDate ? prevEventData.startDate : null
    }));
  };

  return (
    <div className="event-creation_container">
      <video autoPlay muted loop className="wizard_video-background">
        <source src="https://res.cloudinary.com/dvzsvgucq/video/upload/v1679239423/FREE_4K_Light_Leak_o8bz1x.mp4" type="video/mp4" />
        Votre navigateur ne prend pas en charge les vidéos HTML5.
      </video>

      <h2 className="event-creation_title">Création d&apos;événement</h2>

      <form onSubmit={handleEventSubmit} className="event-creation_form">
        <div className="event-creation_type-toggle">
          <label className="event-creation_toggle-label">
            <span className="event-creation_toggle-text">{eventData.isPublic ? 'PUBLIC' : 'PRIVÉ'}</span>
            <div
              className={`event-creation_toggle ${eventData.isPublic ? 'event-creation_public' : 'event-creation_private'}`}
              onClick={handleToggleClick}
            >
              <div className="event-creation_toggle-slider"></div>
            </div>
            {eventData.isPublic && (
              <span className="new-event_tooltip" onClick={() => toggleTooltip('public')}>
                <FontAwesomeIcon icon={faQuestionCircle} onClick={() => toggleTooltip('public')} />
                {showTooltip === 'public' && <span className="new-event_tooltiptext">Un événement ouvert à tous, comme des festivals ou des concerts.</span>}
              </span>
            )}
            {!eventData.isPublic && (
              <span className="new-event_tooltip">
                <FontAwesomeIcon icon={faQuestionCircle} onClick={() => toggleTooltip('prive')} />
                {showTooltip === 'prive' && <span className="new-event_tooltiptext">Un événement sur invitation absent de la carte publique, comme des mariages ou des fêtes privées.</span>}
              </span>
            )}
          </label>
          {errorMessage && <div className={`event-creation_error-message ${showError ? 'event-creation_error-show' : ''}`}>{errorMessage}</div>}
        </div>

        <div className="event-creation_input-group">
          <input
            type="text"
            name="name"
            value={eventData.name}
            onChange={handleInputChange}
            placeholder="Nom de l'événement"
            className="event-creation_input event-creation_title"
          />
        </div>

        <div className="event-creation_input-group event-creation_date-group">
          <div className="event-creation_date-time-container">
            <label htmlFor="startDate" className="event-creation_label event-edit_required-field">Date de début</label>
            <ReactDatePicker
              selected={eventData.startDate}
              onChange={date => setEventData(prevEventData => ({...prevEventData, startDate: date || new Date()}))}
              className="event-creation_input"
              dateFormat="dd/MM/yyyy"
              required
              id="startDate"
            />
          </div>
          {showEndDate && (
            <div className="event-creation_date-time-container">
              <label htmlFor="endDate" className="event-creation_label">Date de fin</label>
              <ReactDatePicker
                selected={eventData.endDate}
                onChange={date => setEventData(prevEventData => ({...prevEventData, endDate: date || prevEventData.startDate} ))}
                className="event-creation_input"
                dateFormat="dd/MM/yyyy"
                id="endDate"
              />
            </div>
          )}
          <button
            type="button"
            onClick={handleEndDateToggle}
            className="event-creation_toggle-end-date-btn"
          >
            {showEndDate ? 'Retirer Date de Fin' : 'Ajouter Date de Fin'}
          </button>
        </div>

        <div className="event-creation_input-group event-creation_time-group">
          <div className="event-creation_date-time-container">
            <label htmlFor="startTime" className="event-creation_label event-edit_required-field">Heure de début</label>
            <Flatpickr
              data-enable-time
              value={eventData.startTime}
              options={flatpickrOptions}
              onChange={(dates: Date[]) => {
                if (dates[0]) {
                    setEventData({ ...eventData, startTime: dates[0].toISOString() });
                }
              }}
              className="event-creation_input"
              id="startTime"
            />
          </div>
          <div className="event-creation_date-time-container">
            <label htmlFor="endTime" className="event-creation_label event-edit_required-field">Heure de fin</label>
            <Flatpickr
              data-enable-time
              value={eventData.endTime}
              options={flatpickrOptions}
              onChange={(dates: Date[]) => {
                if (dates[0]) {
                    setEventData({ ...eventData, endTime: dates[0].toISOString() });
                }
              }}
              className="event-creation_input"
              id="endTime"
            />
          </div>
        </div>

        <div className="event-creation_input-group">
          <select name="category" value={eventData.category} onChange={handleInputChange} className="event-creation_select event-edit_required-field">
            <option value="" className="event-creation_option-placeholder">Choisir une catégorie *</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {errorMessage && (
          <div className={`event-creation_submit-error-message ${showError ? '' : 'event-creation_submit-error-hidden'}`}>
            {errorMessage}
          </div>
        )}

        <button type="submit" className="event-creation_submit-btn">Sauvegarder et continuer</button>
      </form>
    </div>
  );
};

export default EventCreationForm;
