// src/app/profil-pro/page.tsx
'use client';
import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import * as yup from 'yup';
import { getAuth, User, EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import MobileMenu from '../../components/MobileMenu';
import ScrollToTopButton from '../../components/ScrollToTopButton';

interface FirebaseUser {
  uid: string;
  email: string | null;
}

interface SelectedSocialMedias {
  [key: string]: boolean;
}

interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  [key: string]: string | undefined;
}

interface OrganizerProfileInterface {
  firebaseId?: string;
  organizationName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  country?: string;
  city?: string;
  zip?: number;
  profilePic?: string;
  phone?: number;
  website?: string;
  socialMedia: SocialMediaLinks;
}

const OrganizerProfile: React.FC<{ user: FirebaseUser | null }> = ({ user }) => {
  const [error, setError] = useState<any>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [selectedSocialMedias, setSelectedSocialMedias] = useState<SelectedSocialMedias>({});
  const [profileData, setProfileData] = useState<OrganizerProfileInterface>({ socialMedia: {} });
  const socialMediaOptions = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'];
  const [userProfile, setUserProfile] = useState<OrganizerProfileInterface>({
    firebaseId: '',
    organizationName: '',
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    country: '',
    city: '',
    zip: 0,
    profilePic: '',
    phone: 0,
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
      tiktok: '',
    },
  });
  const location = usePathname();
  const calculateCompletionPercentage = (): number => {
    const fieldsToCheck = [
      { name: 'firstName', value: userProfile?.firstName },
      { name: 'lastName', value: userProfile?.lastName },
      { name: 'email', value: userProfile?.email },
      { name: 'phone', value: userProfile?.phone },
      { name: 'zip', value: userProfile?.zip },
      { name: 'city', value: userProfile?.city },
      { name: 'country', value: userProfile?.country },
      { name: 'profilePic', value: userProfile?.profilePic},
      { name: 'address', value: userProfile?.address },
      { name: 'organizationName', value: userProfile?.organizationName},
    ];

    const filledFields = fieldsToCheck.filter(field => field.value).length;
    return Math.round((filledFields / fieldsToCheck.length) * 100);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const fetchUserProfile = async (firebaseId: string) => {
      try {
        const response = await axios.get(`/api/users/${firebaseId}`);
        console.log(response.data);
        setUserProfile(response.data);
        setError(null);
      } catch (err:any) {
        setError(new Error(err.message));
        console.error(err);
      }
    };

    if (user) {
      fetchUserProfile(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if(userProfile) {
      setCompletionPercentage(calculateCompletionPercentage());
    }
  }, [userProfile]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name in userProfile.socialMedia) {
      // Si c'est un lien de média social
      setUserProfile(prevProfile => ({
        ...prevProfile,
        socialMedia: {
          ...prevProfile.socialMedia,
          [name]: value,
        }
      }));
    } else {
      // Autres champs
      setUserProfile(prevProfile => ({
        ...prevProfile,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    schema.validate(userProfile).then(async (data: any) => {
      // If the data is valid, send the request
      try {
        if (userProfile) {
          const response = await axios.post(`/api/users/${userProfile?.firebaseId}`, userProfile);
          console.log(response);
        }
        setError(null);
      } catch (err:any) {
        setError(new Error(err.message));
        console.error(err);
      }
    }).catch((err: any) => {
      // If the data is invalid, log the error
      console.error(err);
      // You can also display the error message to the user here
    });
    const response = await axios.post(`/api/users/${userProfile?.firebaseId}`, userProfile);
    if (response.status === 200) {
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);  // hide after 3 seconds
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError(new Error('Les mots de passe ne correspondent pas.'));
      return;
    }
    try {
      const auth = getAuth();
      const currentUser: User | null = auth.currentUser;
      if (currentUser && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, password);
        setSuccess(true);
        setError(null);
      }
    } catch (err) {
      setError(new Error('Erreur lors de la mise à jour du mot de passe.'));
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.');
    if (confirmation) {
      const enteredPassword = prompt('Veuillez entrer votre mot de passe pour confirmer la suppression de votre compte:');
      if (!enteredPassword) {
        setError(new Error('Suppression annulée.'));
        return;
      }

      try {
        const auth = getAuth();
        const currentUser: User | null = auth.currentUser;

        if (currentUser && currentUser.email) {
          const credential = EmailAuthProvider.credential(currentUser.email, enteredPassword);
          await reauthenticateWithCredential(currentUser, credential);
          await deleteUser(currentUser);
          // Redirect to home page
          window.location.href = '/';
        }
      } catch (err) {
        setError(new Error('Erreur lors de la suppression du compte.'));
      }
    }
  };

  const handleSocialMediaSelect = (media: string) => {
    setSelectedSocialMedias(prev => ({ ...prev, [media]: !prev[media] }));
  };

  const handleSocialMediaLinkChange = (media: string, link: string) => {
    setProfileData(prevProfileData => ({
      ...prevProfileData,
      socialMedia: { ...prevProfileData.socialMedia, [media]: link },
    }));
  };

  const schema = yup.object().shape({
    firstName: yup.string().required('Prénom est obligatoire'),
    lastName: yup.string().required('Nom est obligatoire'),
    email: yup.string().email('Entrez un email valide').required('Email est obligatoire'),
    phone: yup.number().typeError('Entrez un numéro valide').required('Numéro de téléphone est obligatoire'),
    zip: yup.number().typeError('Entrez un code postal valide').required('Code postal est obligatoire'),
    city: yup.string().required('Ville est obligatoire'),
    country: yup.string().required('Pays est obligatoire'),
    address: yup.string().required('Adresse est obligatoire'),
    organizationName: yup.string().required('Nom de l\'organisation est obligatoire'),
  });

  const {getRootProps, getInputProps} = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.bmp', '.webp']
    },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        return;
      }
      const file = acceptedFiles[0];
      try {
        let public_id = '';
        // Supprimer l'ancienne image
        if (userProfile && userProfile.profilePic) {
          public_id = userProfile.profilePic.split('/').pop()?.split('.')[0] ?? '';
          if (public_id) {
            await axios.post(`/api/deleteProfilePic`, { public_id });
          }
        }

        // Télécharger la nouvelle image
        const formData = new FormData();
        formData.append('file', file);
        if (user) {
          const response = await axios.post(`/api/uploadProfilePic/${user.uid}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          // Mettre à jour userProfile avec la nouvelle URL de l'image
          setUserProfile(prevProfile => ({
            ...prevProfile,
            profilePic: response.data.fileUrl
          }));
          window.location.reload();
        } else {
          setError(new Error('Utilisateur non connecté.'));
        }
      } catch (err:any) {
        setError(new Error(err.message));
        console.error(err);
      }
    }
  });

  if (error) {
    return <div>An error occurred: {error.message}</div>;
  }

  console.log(userProfile);

  return (
    <div className="userProfile__big-container">

      {showConfirmation && (
        <div className="joinNewsletter__confirmation">
          Tes informations ont été mises à jour avec succès.
        </div>
      )}

      <div className="userProfile__container">

        <h1 className="userProfile__header">Bienvenue sur ton Profil</h1>
        <p className="userProfile__intro-text">Tu peux modifier tes informations personnelles ici</p>

        <h3>Profil complété à :</h3>
        <div className="progressBarContainer">
          <div
            className="progressBar"
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: completionPercentage === 100 ? '#4CAF50' : '#ffa600'  // Vert si 100%, sinon jaune.
            }}>
            <span className="progressBarText">{completionPercentage}%</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="userProfile__profile-form">
          <div {...getRootProps()} className="userProfile__dropzone">
            <input {...getInputProps()} />
            {userProfile?.profilePic ? (
              <Image src={userProfile.profilePic} alt="myProfilePic" className="userProfile__profile-pic" width={200} height={200} />
            ) : (
              <p>Glisser-déposer une image ici, ou cliquez pour sélectionner une image</p>
            )}
            <small>Photo de Profil</small>
          </div>

          <input
            name="organizationName"
            value={userProfile?.organizationName || ''}
            onChange={handleChange}
            placeholder="Nom de l'organisation"
            className="userProfile__input-field"
          />

          <input
            name="firstName"
            value={userProfile?.firstName || ''}
            onChange={handleChange}
            placeholder="Prénom"
            className="userProfile__input-field"
          />

          <input
            name="lastName"
            value={userProfile?.lastName || ''}
            onChange={handleChange}
            placeholder="Nom"
            className="userProfile__input-field"
          />

          <input
            name="email"
            value={userProfile?.email || ''}
            onChange={handleChange}
            placeholder="Email"
            className="userProfile__input-field"
          />

          <input
            name="phone"
            value={userProfile?.phone || ''}
            onChange={handleChange}
            placeholder="Numéro de téléphone"
            className="userProfile__input-field"
          />

          <input
            name="address"
            value={userProfile?.address || ''}
            onChange={handleChange}
            placeholder="Adresse"
            className="userProfile__input-field"
          />

          <input
            name="zip"
            value={userProfile?.zip || ''}
            onChange={handleChange}
            placeholder="Code postal"
            className="userProfile__input-field"
          />

          <input
            name="city"
            value={userProfile?.city || ''}
            onChange={handleChange}
            placeholder="Ville"
            className="userProfile__input-field"
          />

          <input
            name="country"
            value={userProfile?.country || ''}
            onChange={handleChange}
            placeholder="Pays"
            className="userProfile__input-field"
          />

          <input
            name="website"
            value={userProfile?.website || ''}
            onChange={handleChange}
            placeholder="Site Web"
            className="userProfile__input-field"
          />

          <button type="submit" className="userProfile__submit-btn">Mettre à jour</button>
        </form>

        <form onSubmit={handleChangePassword} className="userProfile__profile-form">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nouveau mot de passe" className="userProfile__input-field" />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmer le nouveau mot de passe" className="userProfile__input-field" />
          {error instanceof Error && <p>{error.message}</p>}
          {success && <p>Mot de passe mis à jour avec succès.</p>}
          <button type="submit" className="userProfile__submit-btn">Changer le mot de passe</button>
        </form>

        <button onClick={handleDeleteAccount} className="userProfile__delete-account-btn">Supprimer mon compte</button>

        {error && (
          <div className="userProfile__alert-message">
            {error.message}
          </div>
        )}

      </div>
      <MobileMenu />
      <ScrollToTopButton />
    </div>
  );
};

export default OrganizerProfile;

{/*
        <div className="socialMediaSelection">
          {socialMediaOptions.map(media => (
            <label key={media}>
              <input
                type="checkbox"
                checked={!!selectedSocialMedias[media]}
                onChange={() => handleSocialMediaSelect(media)}
              />
              {media}
            </label>
          ))}
        </div>

        {socialMediaOptions.map(media =>
          selectedSocialMedias[media] && (
            <input
              key={media}
              type="text"
              placeholder={`Enter your ${media} link`}
              value={profileData.socialMedia[media] || ''}
              onChange={(e) => handleSocialMediaLinkChange(media, e.target.value)}
            />
          )
        )}
*/}
