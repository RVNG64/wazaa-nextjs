// src/app/connexion-choice/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const SignInChoice: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="sign-in-choice-container background-signin">
      <div className="sign-in-choice-content">
        {isLoggedIn ? (
          <div className="sign-in-choice-message">
            <h2>Vous êtes déjà connecté.</h2>
            <p>Veuillez vous déconnecter pour changer de compte.</p>
            <div className="sign-in-choice-buttons">
              <button onClick={() => navigate('/')} className="sign-in-choice-btn-home">Revenir à la carte</button>
              <button onClick={() => auth.signOut()} className="sign-in-choice-btn-disconnect">Se déconnecter</button>
            </div>
          </div>
        ) : (
          <div className="sign-in-choice-options">
            <h1>Choisissez votre type de compte</h1>
            <div className="sign-in-choice-buttons">
              <button onClick={() => navigate('/connexion-pro')} className="sign-in-choice-btn-organizer">Organisateur</button>
              <button onClick={() => navigate('/connexion')} className="sign-in-choice-btn-personal">Compte Personnel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignInChoice;
