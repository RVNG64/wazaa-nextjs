// src/app/inscription/page.tsx
'use client';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '../../utils/api';

const Link = dynamic(() => import('next/link'), { ssr: false });

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signUp = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!termsAccepted) {
      setErrorMessage("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    if (firstName === '' || lastName === '' || email === '' || password === '') {
      setErrorMessage("Tous les champs sont requis.");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("L'email n'est pas valide.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Le mot de passe est trop court.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await api.post(`/api/signup`, {
        firebaseId: user.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
      });

      navigate('/welcomeIntro');
    }
      catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          setErrorMessage("Un utilisateur avec cet email existe déjà.");
        } else {
          console.error(error);
        }
    }
  };

  /*
  const signUpWithGoogle = async () => {
      try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          // Here, you can do something with the user object (e.g. redirecting to the home page)
      } catch (error) {
          console.error(error);
      }
  }; */

  return (
    <>
      <div className="background-signup">
          <div className="signup-container">
            {errorMessage && <p className="signup__error-message">{errorMessage}</p>}
              <form className="signup-form" onSubmit={signUp}>
                  <h1 className="signup-title">Création de votre profil</h1>
                  <input
                      type="text"
                      placeholder="Prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="signup-input"
                  />
                  <input
                      type="text"
                      placeholder="Nom"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="signup-input"
                  />
                  <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="signup-input"
                  />
                  <p className="signup-password-info">Le mot de passe doit contenir au moins 6 caractères.</p>
                  <input
                      type="password"
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="signup-input"
                  />
                  <input
                      type="password"
                      placeholder="Confirmer le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="signup-input"
                  />
                  <div className="signup-terms-acceptance">
                      <input
                          type="checkbox"
                          id="terms"
                          name="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                      />
                      <label htmlFor="terms" className="signup-terms-label">
                        J&apos;accepte les <Link href="/mentions-legales" className="signup-terms-using-conditions">conditions d&apos;utilisation</Link> et la <Link href="/mentions-legales" className="signup-terms-link">politique de confidentialité</Link>.
                      </label>
                  </div>
                  <button type="submit" className="signup-button">Je m&apos;inscris</button>
                  <div className="signup-other-options">
                      {/*<button onClick={signUpWithGoogle} className="signup-button-google">S'inscrire avec Google</button>
                      <button className="signup-button-facebook">S'inscrire avec Facebook</button>
                      <button className="signup-button-apple">S'inscrire avec Apple</button> */}
                  </div>
                  <p className="signup-signin-text">Déjà inscrit ? <Link href="/connexion-choice" className="signup-signin-link">Je me connecte</Link></p>
              </form>
          </div>
      </div>
    </>
  );
};

export default SignUp;
