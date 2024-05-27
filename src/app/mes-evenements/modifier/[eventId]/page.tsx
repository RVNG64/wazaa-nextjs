// src/app/mes-evenements/modifier/[eventId]/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import axios from 'axios';
import { auth } from '../../../../utils/firebase';
import Swal from 'sweetalert2';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'flatpickr/dist/themes/light.css';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { useDropzone } from 'react-dropzone';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import dynamic from 'next/dynamic';

const Image = dynamic(() => import('next/image'), { ssr: false });
const Select = dynamic(() => import('react-select'), { ssr: false });
const Flatpickr = dynamic(() => import('react-flatpickr'), { ssr: false });
const LottieSuccessCheck = dynamic(() => import('../../../../components/lotties/LottieSuccessCheck'), { ssr: false });
const FontAwesomeIcon = dynamic(() => import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon), { ssr: false });
const NativeEventDetailsPopup = dynamic(() => import('../../../../components/NativeEventDetailsPopup'), { ssr: false });
const MiniMap = dynamic(() => import('../../../../components/MiniMapEventDetails.client'), { ssr: false });
const MobileMenu = dynamic(() => import('../../../../components/MobileMenu'), { ssr: false });
const ScrollToTopButton = dynamic(() => import('../../../../components/ScrollToTopButton'), { ssr: false });

interface FileWithPreview extends File {
  preview: string;
}

const EventEdit = () => {
  const categories = ["Musique", "Art", "Sport", "Festival", "Vie nocturne", "Éducation", "Théâtre", "Tourisme", "Business", "Gastronomie", "Famille/Amis", "Pour les petits", "Divertissement", "Social", "Autre"];
  const [showTooltip, setShowTooltip] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [paymentMethods] = useState(['Carte de crédit', 'Espèces', 'Chèque', 'PayPal', 'Virement bancaire', 'Cryptomonnaie', 'Autre']);
  const paymentOptions = paymentMethods.map(method => ({ value: method, label: method }));
  const [pricingOption, setPricingOption] = useState('free'); // 'free', 'unique', ou 'range'
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorGeoMessage, setErrorGeoMessage] = useState('');
  const [showGeoError, setGeoShowError] = useState(false);
  const [showError, setShowError] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [, setTagErrorMessage] = useState("");
  const [, setShowTagError] = useState(false);
  const [tagInputValue, setTagInputValue] = useState("");
  const [isVibrating, setIsVibrating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId;
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const currentLocation = usePathname();
  const maxTags = 3;

  // Fonction pour remonter en haut de la page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentLocation]);

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    organizerName: '',
    category: '',
    address: '',
    description: '',
    capacity: ''
  });

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

  // Télécharger l'affiche de l'événement
  useEffect(() => {
    const uploadImage = async () => {
      if (files.length > 0 && !isImageUploaded) {
        const formData = new FormData();
        formData.append('file', files[0]);

        try {
          const uploadResponse = await axios.post(`/api/uploadEventPoster`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          setEventData(currentData => ({ ...currentData, photoUrl: uploadResponse.data.url }));
          setIsImageUploaded(true); // Indique que l'image a été téléchargée
        } catch (uploadError) {
          console.error('Erreur lors du téléchargement de l\'affiche:', uploadError);
          // Gestion de l'erreur de téléchargement
        }
      }
    };

    uploadImage();
  }, [files, isImageUploaded]); // Se déclenche uniquement lorsque les fichiers changent

  // Les données de l'événement sont stockées dans un objet
  const [eventData, setEventData] = useState({
    isPublic: false,
    name: '',
    type: 'private',
    organizerName: '',
    startDate: new Date(),
    endDate: null as Date | null,
    startTime: '',
    endTime: '',
    category: '',
    subcategory: '',
    photoUrl: '',
    videoUrl: '',
    description: '',
    website: '',
    ticketLink: '',
    tags: [] as string[],
    audience: '',
    location: {
      address: '',
      postalCode: '',
      city: '',
      latitude: 0,
      longitude: 0
    },
    priceOptions: {
      isFree: false,
      uniquePrice: 0,
      priceRange: {
        min: 0,
        max: 0
      }
    },
    accessibleForDisabled: false,
    acceptedPayments: [] as string[],
    capacity: 0,
    userOrganizer: '',
    professionalOrganizer: '',
    validationStatus: 'pending',
  });

  // Récupérer les détails de l'événement à modifier
  useEffect(() => {
    axios.get(`/api/organized/events/edit/${eventId}`)
      .then(response => {
        console.log('Détails de l\'événement stocké:', response.data);
        const data = response.data;

        // Vérification si l'utilisateur est l'organisateur de l'événement
        if (auth.currentUser && response.data.userID === auth.currentUser.uid) {
          setIsOrganizer(true);
        }

        // Initialiser le type d'événement (public ou privé)
        data.isPublic = data.type === 'public';

        // Conversion des dates et heures en objets Date
        const startDateParts = data.startDate.split('/');
        data.startDate = new Date(`${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`);

        if (data.endDate) {
          const endDateParts = data.endDate.split('/');
          data.endDate = new Date(`${endDateParts[2]}-${endDateParts[1]}-${endDateParts[0]}`);
        } else {
          data.endDate = null;
        }

        // Stocker les heures de début et de fin originales
        data.originalStartTime = data.startTime;
        data.originalEndTime = data.endTime;
        // console.log('Heure de début originale récupérée:', data.originalStartTime);
        // console.log('Heure de fin originale récupérée:', data.originalEndTime);

        // Initialiser les options de prix
        if (data.priceOptions.isFree) {
          setPricingOption('free');
        } else if (data.priceOptions.uniquePrice > 0) {
          setPricingOption('unique');
        } else if (data.priceOptions.priceRange.min > 0 && data.priceOptions.priceRange.max > 0) {
          setPricingOption('range');
        }

        // Initialiser les méthodes de paiement
        setSelectedPayments(data.acceptedPayments);

        setEventData(data); // Initialisez l'état avec les données récupérées
      })
      .catch(error => console.error("Erreur lors de la récupération des détails de l'événement:", error));
  }, [eventId]);

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
      setEventData(prevState => ({
        ...prevState,
        isPublic: !prevState.isPublic, // Inverse l'état isPublic
        type: prevState.isPublic ? 'private' : 'public' // Change le type en fonction de isPublic
      }));
    }
  };

  const validateField = (name: string, value: string) => {
    let errorEditMessage = '';
    if (name === 'name' && value.length < 2) {
      errorEditMessage = 'Le nom de l\'événement doit contenir au moins 2 caractères.';
    } else if (name === 'organizerName' && value.length < 2) {
      errorEditMessage = 'Le nom de l\'organisateur doit contenir au moins 2 caractères.';
    } else if (name === 'category' && value === '') {
      errorEditMessage = 'Veuillez sélectionner une catégorie.';
    } else if (name === 'address' && value.length < 3) {
      errorEditMessage = 'Veuillez entrer une adresse valide.';
    } else if (name === 'description' && value.length < 50) {
      errorEditMessage = 'La description doit contenir au moins 50 caractères.';
    } else if (name === 'capacity' && parseInt(value) < 1) {
      errorEditMessage = 'La capacité d\'accueil doit être supérieure à 0.';
    } else {
      errorEditMessage = '';
    }
    return errorEditMessage;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, field?: string) => {
    const { name, value } = e.target;
    const errorEditMessage = validateField(name, value);

    setFieldErrors(prevErrors => ({
      ...prevErrors,
      [name]: errorEditMessage
    }));

    if (field === 'address') {
      setEventData(prevState => ({
        ...prevState,
        location: {
          ...prevState.location,
          address: value
        }
      }));
    } else {
      setEventData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handlePaymentChange = (selectedOptions: any) => {
    setSelectedPayments(selectedOptions.map((option: { value: any; }) => option.value));
    setEventData(prevState => ({
      ...prevState,
      acceptedPayments: selectedOptions.map((option: { value: any; }) => option.value)
    }));
  };

  const handleTimeChange = (name: string, date: Date) => {
    const formattedTime = formatTime(date);
    console.log('Heure formatée (handleTimeChange):', formattedTime);
    setEventData(prevEventData => ({
      ...prevEventData,
      [name]: formattedTime
    }));
    console.log('Données de l\'événement après le changement de l\'heure (handleTimeChange):', eventData);
  };

  const formatTime = (dateInput: Date) => {
    console.log('Date à formater (formatTime):', dateInput);
    if (!dateInput || isNaN(dateInput.getTime())) return '';

    let hours = dateInput.getHours().toString().padStart(2, '0');
    let minutes = dateInput.getMinutes().toString().padStart(2, '0');
    console.log('Heure formatée (formatTime):', `${hours}:${minutes}`);
    return `${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Données de l\'événement avant envoi:', eventData);

    // Log supplémentaire pour la validation
    console.log('Validation Status avant détermination:', eventData.validationStatus);

    // Vérification de l'URL
    const urlsToCheck = [eventData.photoUrl, eventData.videoUrl, eventData.website, eventData.ticketLink];
    const isValidUrl = (url: string | undefined) => {
      return typeof url === 'undefined' || url === '' || /^[a-zA-Z]+:\/\//.test(url);
    };
    const areUrlsValid = urlsToCheck.every(isValidUrl);
    if (!areUrlsValid) {
      setErrorMessage('Veuillez entrer des URL valides.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const missingFields = [];
    if (!eventData.name) missingFields.push('Nom');
    if (!eventData.organizerName) missingFields.push('Organisateur');
    if (!eventData.startDate) missingFields.push('Date de début');
    if (!eventData.startTime) missingFields.push('Heure de début');
    if (!eventData.endTime) missingFields.push('Heure de fin');
    if (!eventData.category) missingFields.push('Catégorie');
    if (!eventData.location.address) missingFields.push('Adresse');
    if (!eventData.location.latitude) missingFields.push('Latitude');
    if (!eventData.location.longitude) missingFields.push('Longitude');
    if (!eventData.description || eventData.description.length < 20) missingFields.push('Description (minimum 20 caractères)');
    if (!areUrlsValid) missingFields.push('URL(s) invalide(s)');

    if (missingFields.length > 0) {
      setErrorMessage(`Champs manquants ou invalides : ${missingFields.join(', ')}.`);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    // Préparation des données tarifaires
    let priceOptions = {};
    if (eventData.priceOptions.isFree) {
      priceOptions = { isFree: true };
    } else if (eventData.priceOptions.uniquePrice > 0) {
      priceOptions = { uniquePrice: eventData.priceOptions.uniquePrice };
    } else if (eventData.priceOptions.priceRange.min > 0 && eventData.priceOptions.priceRange.max > 0) {
      priceOptions = { priceRange: eventData.priceOptions.priceRange };
    }

    // Formatage de la date en JJ/MM/AAAA
    const formatDateCreate = (date: Date | string) => {
      const d = new Date(date);
      let day = ('0' + d.getDate()).slice(-2);
      let month = ('0' + (d.getMonth() + 1)).slice(-2);
      let year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };
    /* console.log('Date de début:', formatDateCreate(eventData.startDate));
    if (eventData.endDate) {
      console.log('Date de fin:', formatDateCreate(eventData.endDate));
    } */

    // Formatage de l'heure en HH:MM si elle existe
    const formatTimeCreate = (time: string) => {
      if (!eventData.startTime) return eventData.startTime; // Retourner l'heure telle quelle si elle n'est pas définie
      if (!eventData.endTime) return eventData.endTime; // Retourner l'heure telle quelle si elle n'est pas définie
      if (!time) return ''; // Retourner une chaîne vide si l'heure n'est pas définie
      try {
        const t = new Date(`1970-01-01T${time}`);
        let hours = ('0' + t.getHours()).slice(-2);
        let minutes = ('0' + t.getMinutes()).slice(-2);
        return `${hours}:${minutes}`;
      } catch {
        return ''; // Retourner une chaîne vide en cas d'erreur
      }
    };
    // console.log('Heure de début:', formatTimeCreate(eventData.startTime));
    // console.log('Heure de fin:', formatTimeCreate(eventData.endTime));

    // Déterminer le statut de validation
    let validationStatus;
    if (!eventData.isPublic) {
      validationStatus = 'approved';
    } else {
      switch (eventData.validationStatus) {
        case 'default':
        case 'rejected':
        case 'approved':
          validationStatus = 'pending';
          break;
        case 'pending':
          validationStatus = 'pending';
          break;
        default:
          validationStatus = 'pending';
      }
    }

    // Log supplémentaire après détermination
    console.log('Validation Status après détermination:', validationStatus);

    // EventCreatedData est un objet contenant les données à envoyer à MongoDB
    const eventCreatedData = {
      isPublic: eventData.isPublic,
      name: eventData.name,
      type: eventData.isPublic ? 'public' : 'private',
      organizerName: eventData.organizerName,
      startDate: formatDateCreate(eventData.startDate),
      endDate: eventData.endDate ? formatDateCreate(eventData.endDate) : formatDateCreate(eventData.startDate),
      startTime: eventData.startTime || formatTimeCreate(eventData.startTime),
      endTime: eventData.endTime || formatTimeCreate(eventData.endTime),
      category: eventData.category,
      userID: auth.currentUser ? auth.currentUser.uid : null,
      photoUrl: eventData.photoUrl,
      videoUrl: eventData.videoUrl,
      description: eventData.description,
      website: eventData.website,
      ticketLink: eventData.ticketLink,
      tags: eventData.tags,
      audience: eventData.audience,
      location: {
        address: eventData.location.address,
        postalCode: eventData.location.postalCode,
        city: eventData.location.city,
        latitude: eventData.location.latitude,
        longitude: eventData.location.longitude
      },
      priceOptions,
      accessibleForDisabled: eventData.accessibleForDisabled,
      acceptedPayments: selectedPayments,
      capacity: eventData.capacity,
      validationStatus: validationStatus
    };

    console.log('Données à envoyer:', eventCreatedData);

    if (eventCreatedData) {
      try {
        const response = await axios.put(`/api/organized/events/update/${eventId}`, eventCreatedData);
        console.log('Mise à jour réussie:', response.data);
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowSuccessAnimation(false);
          navigate(`/mes-evenements`);
        }, 2000);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'événement:", error);
        setErrorMessage("Erreur lors de la mise à jour. Veuillez réessayer.");
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

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

  // Options pour le composant Flatpickr
  const flatpickrOptions = {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    locale: French,
    time_24hr: true
  };

  // Géocodage de l'adresse pour obtenir les coordonnées géographiques
  const handleAddressChange = async (address: string) => {
    try {
      const response = await axios.get(`/api/geocode`, { params: { address } });

      // Gérer le cas où aucun résultat n'est trouvé
      if (response.data.status === 'ZERO_RESULTS') {
        console.log('Aucun résultat trouvé pour cette adresse.');
        setErrorGeoMessage("Adresse introuvable. Veuillez entrer une adresse valide.");
        setGeoShowError(true);
        setTimeout(() => setGeoShowError(false), 3000);
        setShowMap(false); // Masquer la carte
        return;
      }
      const results = response.data.results[0];
      const addressComponents = results.address_components;
      const city = addressComponents.find((comp: { types: string | string[]; }) => comp.types.includes("locality"))?.long_name || '';
      const postalCode = addressComponents.find((comp: { types: string | string[]; }) => comp.types.includes("postal_code"))?.long_name || '';

      const { lat, lng } = response.data.results[0].geometry.location;
      console.log('Coordonnées géographiques:', lat, lng);
      console.log('Adresse formatée:', results.formatted_address);
      console.log('Ville:', city);
      console.log('Code postal:', postalCode);

      setEventData(prevEventData => ({
        ...prevEventData,
        location: {
          ...prevEventData.location, // Conserver les valeurs existantes
          address: results.formatted_address,
          city: city,
          postalCode: postalCode,
          latitude: results.geometry.location.lat,
          longitude: results.geometry.location.lng
        }
      }));
      setShowMap(true); // Afficher la carte après avoir obtenu les coordonnées
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
      setErrorGeoMessage("Une erreur s'est produite lors de la recherche de l'adresse. Veuillez réessayer.");
      setGeoShowError(true);
      setTimeout(() => setGeoShowError(false), 3000);
      setShowMap(false); // Masquer la carte si une erreur se produit
    }
  };

  const handlePricingOptionChange = (option: string) => {
    setPricingOption(option);
    if (option === 'free') {
      setEventData(prevEventData => ({
        ...prevEventData,
        priceOptions: {
          ...prevEventData.priceOptions,
          isFree: true,
          uniquePrice: 0,
          priceRange: { min: 0, max: 0 }
        }
      }));
    } else if (option === 'unique') {
      setEventData(prevEventData => ({
        ...prevEventData,
        priceOptions: {
          ...prevEventData.priceOptions,
          isFree: false,
          uniquePrice: 0,
          priceRange: { min: 0, max: 0 }
        }
      }));
    } else if (option === 'range') {
      setEventData(prevEventData => ({
        ...prevEventData,
        priceOptions: {
          ...prevEventData.priceOptions,
          isFree: false,
          uniquePrice: 0,
          priceRange: { min: 0, max: 0 }
        }
      }));
    }
  };

  const customStyles = {
    control: (styles: any) => ({
      ...styles,
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '0.9rem'
    }),
    option: (styles: any, { isFocused, isSelected }: any) => ({
      ...styles,
      backgroundColor: isSelected ? '#2c3e50' : isFocused ? '#34495e' : '#fff',
      color: isSelected ? '#fff' : isFocused ? '#fff' : '#333'
    }),
    multiValue: (styles: any) => ({
      ...styles,
      backgroundColor: '#2c3e50',
      color: '#fff'
    }),
    multiValueLabel: (styles: any) => ({
      ...styles,
      color: '#fff'
    }),
    multiValueRemove: (styles: any) => ({
      ...styles,
      color: '#fff'
    })
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInputValue(e.currentTarget.value);
  };

  const handleAddTag = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (eventData.tags.length === maxTags) {
      setIsVibrating(true);
      setTimeout(() => setIsVibrating(false), 500);
      setTagErrorMessage("Vous ne pouvez pas ajouter plus de 3 tags.");
      setShowTagError(true);
      return;
    }

    if (tagInputValue) {
      setEventData(prevEventData => ({
        ...prevEventData,
        tags: [...prevEventData.tags, tagInputValue.trim()]
      }));
      setTagInputValue(""); // Réinitialiser l'input
      setShowTagError(false); // Masquer l'erreur
      setTagErrorMessage(""); // Effacer le message d'erreur
    }
  };

  const removeTag = (indexToRemove: number) => {
    setEventData(prevEventData => ({
      ...prevEventData,
      tags: prevEventData.tags.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleDelete = async () => {
    const confirmDelete = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (confirmDelete.isConfirmed) {
      try {
        const response = await axios.delete(`/api/organized/events/delete/${eventId}`);
        console.log('Événement supprimé:', response.data);
        Swal.fire(
          'Supprimé !',
          'Votre événement a été supprimé.',
          'success'
        );
        // Rediriger l'utilisateur après la suppression
        navigate('/mes-evenements');
      } catch (error) {
        console.error("Erreur lors de la suppression de l'événement:", error);
        Swal.fire(
          'Erreur !',
          "Erreur lors de la suppression de l'événement. Veuillez réessayer.",
          'error'
        );
      }
    }
  };

  const handlePreview = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log('Prévisualisation de l\'événement:', eventData);
    setShowPreview(true);
  };

  // Gestion du téléchargement de fichiers
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length > 0 && acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0];
      const currentFile = files[0];

      // Comparer les fichiers
      if (newFile.size === currentFile.size && newFile.lastModified === currentFile.lastModified) {
        console.log('Le même fichier a été sélectionné à nouveau');
        return;
      }
    }

    // Révoquer et mettre à jour
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
    setIsImageUploaded(false); // Réinitialiser le statut de téléchargement
  }, [files]);

  // Utilisation de la fonction de téléchargement de fichiers
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Afficher les aperçus des fichiers
  const images = files.map((file: FileWithPreview) => (
    <div key={file.name}>
      <Image src={file.preview} style={{ width: "100px", height: "auto" }} alt="Aperçu de l&apos;affiche" width={100} height={100} />
    </div>
  ));

  const successCheck = 'https://res.cloudinary.com/dvzsvgucq/raw/upload/v1716628048/LottieSuccessCheck_1712519182257_kxqc2u.json';

  if (!eventData) {
    return <div>Chargement des données de l&apos;événement...</div>;
  }

  return (
    <div className="event-edit_container">
      <video autoPlay muted loop className="wizard_video-background">
        <source src="https://res.cloudinary.com/dvzsvgucq/video/upload/v1679239423/FREE_4K_Light_Leak_o8bz1x.mp4" type="video/mp4" />
        Votre navigateur ne prend pas en charge les vidéos HTML5.
      </video>

      <h1 className="event-creation_title">Modifier mon événement</h1>

      <form onSubmit={handleSubmit} className="event-edit-form">

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

        {/* Nom de l'événement */}
        <div className="event-creation_input-group">
          <input
            type="text"
            name="name"
            value={eventData.name}
            onChange={handleInputChange}
            placeholder="Nom de l'événement*"
            className="event-creation_input event-creation_title event-edit_required-field"
            required
          />
          {fieldErrors.name && <div className="error-message">{fieldErrors.name}</div>}
        </div>

        {/* Organisateur */}
        <div className="event-edit_input-group">
          <label htmlFor="photoUrl" className="event-edit_label event-edit_required-field">Organisateur</label>
          <input
            type="text"
            name="organizerName"
            id="organizerName"
            value={eventData.organizerName}
            onChange={handleInputChange}
            placeholder="Nom de l'organisateur"
            className="event-edit_input"
            required
          />
          {fieldErrors.organizerName && <div className="error-message">{fieldErrors.organizerName}</div>}
        </div>

        {/* Catégorie */}
        <div className="event-creation_input-group">
          <label htmlFor="category" className="event-edit_label event-edit_required-field">Catégorie</label>
          <select name="category" value={eventData.category} onChange={handleInputChange} className="event-creation_select">
            <option value="">Choisir une catégorie*</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
          {fieldErrors.category && <div className="error-message">{fieldErrors.category}</div>}
        </div>

        {/* Tags */}
        <div className="event-edit_input-group">
          <label htmlFor="tags" className="event-edit_label">Tags (max. 3)</label>
          <div className="event-edit_tags-container">
            {eventData.tags.map((tag, index) => (
              <span key={index} className="event-edit_tag" onClick={() => removeTag(index)}>
                {tag}
              </span>
            ))}
            <input
              type="text"
              value={tagInputValue}
              onChange={handleTagInputChange}
              placeholder="Ajouter un tag (max. 3)"
            />
            <button
              type="button"
              onClick={(e) => handleAddTag(e)}
              disabled={eventData.tags.length >= maxTags}
              className={`event-edit_geocode-btn ${isVibrating ? 'event-edit_error-btn-vibrate' : ''}`}
              onMouseEnter={() => eventData.tags.length >= maxTags && setShowTagError(true)}
              onMouseLeave={() => setShowTagError(false)}
            >Ajouter Tag</button>
          </div>
        </div>

        {/* Lieu */}
        <div className="event-edit_address-group">
          <div className="event-edit_input-group">
            <label htmlFor="address" className="event-edit_label event-edit_required-field">Lieu</label>
            <input
              type="text"
              name="address"
              value={eventData.location?.address || ''}
              onChange={(e) => handleInputChange(e, 'address')}
              placeholder="Lieu, adresse, code postal, ville"
              className="event-edit_input"
              required
            />
            <button
              type="button"
              onClick={() => handleAddressChange(eventData.location?.address)}
              className="event-edit_geocode-btn"
            >
              Valider
            </button>
            {fieldErrors.address && <div className="error-message">{fieldErrors.address}</div>}
            {showGeoError && <div className="event-edit_error-message">{errorGeoMessage}</div>}
          </div>

          {/* MiniMap - Affichez la carte seulement si les coordonnées sont disponibles */}
          {showMap &&
            <MiniMap lat={eventData.location.latitude} lng={eventData.location.longitude} />
          }
        </div>

        {/* Zone de téléchargement pour l'affiche */}
        <div className="event-edit_input-group">
          <label className="event-edit_label">Affiche</label>
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <p>Glissez-déposez votre fichier ici, ou cliquez pour le sélectionner</p>
          </div>
          <aside className="aside">
            <div className="event-edit_preview-container">{images}</div>
          </aside>
        </div>

        {/* Vidéo */}
        <div className="event-edit_input-group">
          <label htmlFor="videoUrl" className="event-edit_label">Vidéo</label>
          <input
            type="text"
            name="videoUrl"
            id="videoUrl"
            value={eventData.videoUrl}
            onChange={handleInputChange}
            placeholder="URL de la vidéo de l'événement"
            className="event-edit_input"
          />
        </div>

        {/* Date et heure */}
        <div className="event-creation_input-group event-creation_date-group">
          <div className="event-creation_date-time-container">
            <label htmlFor="startDate" className="event-creation_label event-edit_required-field">Date de début</label>
            <ReactDatePicker
              selected={eventData.startDate}
              onChange={date => setEventData(prevEventData => ({...prevEventData, startDate: date || new Date()}))}
              className="event-creation_input"
              dateFormat="dd/MM/yyyy"
              id="startDate"
              required
            />
          </div>
          <div className="event-creation_input-group event-creation_end-date" style={{ overflow: 'visible' }}>
            <div className="event-creation_date-time-container">
              <label htmlFor="endDate" className="event-creation_label event-edit_required-field">Date de fin</label>
              <ReactDatePicker
                selected={eventData.endDate}
                onChange={date => setEventData(prevEventData => ({...prevEventData, endDate: date || prevEventData.startDate} ))}
                className="event-creation_input"
                dateFormat="dd/MM/yyyy"
                id="endDate"
              />
            </div>
          </div>
        </div>

        <div className="event-creation_input-group event-creation_time-group">
          <div className="event-creation_date-time-container">
            <label htmlFor="startTime" className="event-creation_label event-edit_required-field">Heure de début</label>
            <Flatpickr
              data-enable-time
              value={eventData.startTime}
              options={flatpickrOptions}
              onChange={(dates) => handleTimeChange('startTime', dates[0])}
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
              onChange={(dates) => handleTimeChange('endTime', dates[0])}
              className="event-creation_input"
              id="endTime"
            />
          </div>
        </div>

        {/* Capacité */}
        <div className="event-edit_input-group">
          <label htmlFor="capacity" className="event-edit_label event-edit_required-field">Capacité</label>
          <input
            type="number"
            name="capacity"
            id="capacity"
            value={eventData.capacity}
            onChange={(e) => setEventData({ ...eventData, capacity: parseInt(e.target.value) })}
            placeholder="Nombre maximum de participants"
            className="event-edit_input"
            required
          />
          {fieldErrors.capacity && <div className="error-message">{fieldErrors.capacity}</div>}
        </div>

        {/* Description */}
        <div className="event-edit_input-group">
          <label htmlFor="description" className="event-edit_label event-edit_required-field">Description</label>
          <textarea
            name="description"
            id="description"
            value={eventData.description}
            onChange={handleInputChange}
            placeholder="Description de l'événement"
            className="event-edit_textarea"
            rows={5}
            required
          />
        </div>
        {fieldErrors.description && <div className="error-message">{fieldErrors.description}</div>}

        {/* Audience */}
        <div className="event-edit_audience-group">
          <label className="event-edit_label">Audience</label>
          <div className="event-edit_radio-options">
            {['Locale', 'Régionale', 'Nationale', 'Internationale'].map((audienceType, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name="audience"
                  value={audienceType}
                  checked={eventData.audience === audienceType}
                  onChange={(e) => setEventData({ ...eventData, audience: e.target.value })}
                />
                {audienceType}
              </label>
            ))}
          </div>
        </div>

        {/* Site Web */}
        <div className="event-edit_input-group">
          <label htmlFor="website" className="event-edit_label">Site Web</label>
          <input
            type="text"
            name="website"
            id="website"
            value={eventData.website}
            onChange={handleInputChange}
            placeholder="URL du site web de l'événement"
            className="event-edit_input"
          />
        </div>

        {/* Lien Billetterie */}
        <div className="event-edit_input-group">
          <label htmlFor="ticketLink" className="event-edit_label">Lien Billetterie</label>
          <input
            type="text"
            name="ticketLink"
            id="ticketLink"
            value={eventData.ticketLink}
            onChange={handleInputChange}
            placeholder="URL du lien de la billetterie"
            className="event-edit_input"
          />
        </div>

        {/* Gestion de la tarification */}
        <div className="event-edit_pricing-group">
          <div className="event-edit_pricing-options">
            <div className="event-edit_pricing-options-info">
              <label htmlFor="pricing" className="event-edit_label event-edit_required-field">Tarification</label>
            </div>
            <div className="event-edit_pricing-options-buttons">
              <button
                type="button" onClick={() => handlePricingOptionChange('free')}
                className={`event-edit_pricing-option-button ${pricingOption === 'free' ? 'active' : ''}`}
              >Gratuit</button>
              <button
                type="button"
                onClick={() => handlePricingOptionChange('unique')}
                className={`event-edit_pricing-option-button ${pricingOption === 'unique' ? 'active' : ''}`}
              >Tarif unique</button>
              <button
                type="button"
                onClick={() => handlePricingOptionChange('range')}
                className={`event-edit_pricing-option-button ${pricingOption === 'range' ? 'active' : ''}`}
              >Gamme de prix</button>
            </div>
          </div>

          {pricingOption === 'unique' && (
            <div className="event-edit_price-range">
              <label htmlFor="uniquePrice" className="event-edit_label" style={{ fontSize: '0.8rem' }}>Tarif* (€)</label>
              <input
                type="number"
                value={eventData.priceOptions.uniquePrice}
                onChange={(e) => setEventData({
                  ...eventData,
                  priceOptions: {
                    ...eventData.priceOptions,
                    uniquePrice: parseFloat(e.target.value)
                  }
                })}
                name="uniquePrice"
                id="uniquePrice"
                className="event-edit_price-input"
              />
            </div>
          )}

          {pricingOption === 'range' && (
            <div className="event-edit_price-range">
              <label htmlFor="minPrice" className="event-edit_price-range-label">Prix min* (€)</label>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={eventData.priceOptions.priceRange.min}
                className="event-edit_price-range-input"
                onChange={(e) => setEventData({
                  ...eventData,
                  priceOptions: {
                    ...eventData.priceOptions,
                    priceRange: { ...eventData.priceOptions.priceRange, min: parseFloat(e.target.value) }
                  }
                })}
              />
              <label htmlFor="maxPrice" className="event-edit_price-range-label">Prix max* (€)</label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={eventData.priceOptions.priceRange.max}
                className="event-edit_price-range-input"
                onChange={(e) => setEventData({
                  ...eventData,
                  priceOptions: {
                    ...eventData.priceOptions,
                    priceRange: { ...eventData.priceOptions.priceRange, max: parseFloat(e.target.value) }
                  }
                })}
              />
            </div>
          )}
        </div>

        {/* Sélection des méthodes de paiement */}
        <div className="event-edit_payment-group">
          <label htmlFor="paymentMethods" className="event-edit_label event-edit_required-field">Moyens de paiement acceptés</label>
          <Select
            options={paymentOptions}
            isMulti
            value={selectedPayments.map(payment => ({ value: payment, label: payment }))}
            onChange={handlePaymentChange}
            styles={customStyles}
          />
        </div>

        {/* Accessibilité aux personnes handicapées */}
        <div className="event-edit_accessibility-group">
          <label htmlFor="accessibleForDisabled" className="event-edit_label event-edit_required-field">Accessibilité aux personnes à mobilité réduite</label>
          <div className="event-edit_toggle-switch">
            <input
              id="accessibleForDisabled"
              type="checkbox"
              checked={eventData.accessibleForDisabled}
              onChange={(e) => setEventData({ ...eventData, accessibleForDisabled: e.target.checked })}
            />
            <label htmlFor="accessibleForDisabled" className="event-edit_toggle-slider"></label>
          </div>
        </div>

        {errorMessage && (
          <div className={`event-creation_submit-error-message ${showError ? '' : 'event-creation_submit-error-hidden'}`}>
            {errorMessage}
          </div>
        )}
            <button type="button" onClick={handlePreview} className="event-edit_delete-button events-organized_preview-button">Prévisualiser l&apos;événement</button>

          {errorMessage && (
            <div className="event-creation_submit-error-message">
              {errorMessage}
            </div>
          )}
          <button type="submit" className="events-organized_action-button">Publier {eventData.name}</button>
            <button onClick={handleDelete} className="event-edit_delete-button">Supprimer l&apos;événement</button>
        <div className="event-creation_submit-buttons">
        </div>

        {showSuccessAnimation &&
          <div className="event-creation_success-check-overlay">
            <h2 className="event-creation_success-message">Événement mis à jour avec succès !</h2>
            <LottieSuccessCheck animationUrl={successCheck} />
          </div>
        }
        <NativeEventDetailsPopup eventData={eventData} isPreview={showPreview} onClose={() => setShowPreview(false)} />
        <ScrollToTopButton />
        <MobileMenu />
      </form>
    </div>
  );
};

export default EventEdit;
