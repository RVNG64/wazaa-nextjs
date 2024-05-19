'use client';
import React, { useEffect, useState } from 'react';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

async function getUserFromDatabase(uid: string) {
  const response = await fetch(`/api/users/${uid}`);
  const userDoc = await response.json();
  return userDoc;
}

const SignIn = () => {
    const auth = getAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();
    const navigate = (path: string) => {
      router.push(path);
    };

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

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

            // Check if the user is new
            if (user) {
              const userInDatabase = await getUserFromDatabase(user.uid);
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
/*
    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            // Here, you can do something with the user object (e.g. redirecting to the home page)
        } catch (error) {
            console.error(error);
        }
    };
*/

    const handleForgotPassword = async () => {
      // Vérification si l'e-mail est vide
      if (!email) {
        setErrorMessage('Veuillez entrer votre adresse e-mail pour réinitialiser le mot de passe.');
        return;
      }

      try {
          await sendPasswordResetEmail(auth, email);
          setErrorMessage('Un e-mail de réinitialisation du mot de passe a été envoyé à votre adresse e-mail. Veuillez vérifier votre boîte de réception.');
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
        <Head>
          <title>Connexion | WAZAA</title>
          <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
          <meta name="description" content="Plongez dans un univers d'événements près de chez vous avec Wazaa ! Connectez-vous dès maintenant pour profiter de toutes les fonctionnalités." />
          <meta property="og:title" content="WAZAA - un monde d'événements autour de vous" />
          <meta property="og:description" content="Plongez dans un univers d'événements près de chez vous avec Wazaa ! Connectez-vous dès maintenant pour profiter de toutes les fonctionnalités." />
          <meta property="og:url" content="https://www.wazaa.app/" />
          <meta property="og:image" content="%PUBLIC_URL%/og-image.png" />
          <meta property="og:image:secure_url" content="%PUBLIC_URL%/og-image.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="WAZAA - un monde d'événements autour de vous" />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:type" content="website" />
          <meta property="og:locale" content="fr_FR" />
          <meta property="og:site_name" content="WAZAA" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@wazaa_app" />
          <meta name="twitter:creator" content="@wazaa_app" />
          <meta name="twitter:title" content="WAZAA - un monde d'événements autour de vous" />
          <meta name="twitter:description" content="Plongez dans un univers d'événements près de chez vous avec Wazaa ! Connectez-vous dès maintenant pour profiter de toutes les fonctionnalités." />
          <meta name="twitter:image" content="%PUBLIC_URL%/og-image.png" />
          <meta name="twitter:image:alt" content="WAZAA - un monde d'événements autour de vous" />
          <meta name="twitter:url" content="https://www.wazaa.app/" />
          <meta name="twitter:domain" content="wazaa.app" />
        </Head>
        <div className="background-signin">
            <div className="signin-container">
                {errorMessage && <p className="signup__error-message">{errorMessage}</p>}
                <form className="signin-form" onSubmit={signIn}>
                    <h1>Connexion à votre compte</h1>
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
                    <p className="signup-signin-text">Pas encore inscrit ? <Link href="/inscription-choice" className="signup-signin-link">Je m&apos;inscris</Link></p>
                </form>
            </div>
        </div>
      </>
    );
};

export default SignIn;
