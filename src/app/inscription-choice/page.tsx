// src/app/inscription-choice/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const SignUpChoice = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth();
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const location = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="sign-in-choice-container background-signin">
      <div className="sign-in-choice-content">
        {isLoggedIn ? (
          <div className="sign-in-choice-message">
            <h2>Vous êtes déjà connecté.</h2>
            <p>Veuillez vous déconnecter pour créer un nouveau compte.</p>
            <div className="sign-in-choice-buttons">
              <button onClick={() => handleNavigate('/')} className="sign-in-choice-btn-home">Revenir à la carte</button>
              <button onClick={() => auth.signOut()} className="sign-in-choice-btn-disconnect">Se déconnecter</button>
            </div>
          </div>
        ) : (
          <div className="sign-in-choice-options">
            <h1>Quel type de compte souhaitez-vous créer ?</h1>
            <div className="sign-in-choice-buttons">
              <button onClick={() => handleNavigate('/inscription-pro')} className="sign-in-choice-btn-organizer">Professionnel</button>
              <button onClick={() => handleNavigate('/inscription')} className="sign-in-choice-btn-personal">Personnel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpChoice;
