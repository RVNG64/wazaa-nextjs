'use client';
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

async function getUserFromDatabase(uid: string) {
  const response = await fetch(`/api/users/${uid}`);
  const userDoc = await response.json();
  return userDoc;
}

const SignInOrganizer = () => {
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };

  const validateForm = () => {
    if (!email || !password) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return false;
    }
    return true;
  };

  const signIn = async (event: React.FormEvent) => {
      event.preventDefault();

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Here, you can do something with the user object (e.g. redirecting to the home page)

        // Check if the user is new
        if (user) {
          const userInDatabase = await getUserFromDatabase(user.uid); // Replace this function with the appropriate one for your case
          const hasCompletedProfile = userInDatabase.hasCompletedProfile;
          navigate('/');
        }
      } catch (error: any) {
        if (error.code === "auth/wrong-password") {
          setErrorMessage("Le mot de passe est incorrect.");
        } else if (error.code === "auth/user-not-found") {
          setErrorMessage("L'adresse e-mail n'est pas enregistrée.");
        } else {
          setErrorMessage("Une erreur inattendue s'est produite. Veuillez réessayer.");
        }
      }
  };

  const handleForgotPassword = async () => {
    // Vérification si l'e-mail est vide
    if (email.trim() === '') {
        setErrorMessage('Veuillez entrer votre adresse e-mail.');
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        setErrorMessage('Un e-mail de réinitialisation du mot de passe a été envoyé à votre adresse e-mail.');
    } catch (error: any) {
        // Gestion des erreurs spécifiques
        switch (error.code) {
            case "auth/invalid-email":
                setErrorMessage("L'adresse e-mail est invalide.");
                break;
            case "auth/user-not-found":
                setErrorMessage("Il n'y a pas d'utilisateur correspondant à cette adresse e-mail.");
                break;
            default:
                setErrorMessage('Une erreur est survenue lors de la réinitialisation du mot de passe.');
                console.error(error);
        }
    }
};

  return (
    <>
      <div className="background-sign-pro">
        <div className="signin-container">
          {errorMessage && <p className="signup__error-message">{errorMessage}</p>}
          <form className="signin-form" onSubmit={signIn}>
              <h2>Connexion à votre compte</h2>
              <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="signin-input"
              />
              <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="signin-input"
              />
              <button type="submit" className="signin-button">Je me connecte</button>
              <button type="button" onClick={handleForgotPassword} className="forgot-password-button">Mot de passe oublié ?</button>
              <div className="signin-other-options">
                  {/*<button onClick={signInWithGoogle} className="signin-button-google">Se connecter avec Google</button>
                  <button className="signin-button-facebook">Se connecter avec Facebook</button>
                  <button className="signin-button-apple">Se connecter avec Apple</button> */}
              </div>
              <p>Pas encore inscrit ? <Link href="/inscription-choice">Je m&apos;inscris</Link></p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignInOrganizer;
