import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import dynamic from 'next/dynamic';

const Link = dynamic(() => import('next/link'), { ssr: false });
const ContactPopup = dynamic(() => import('./ContactPopup'), { ssr: false });
const LoginRequiredPopup = dynamic(() => import('./LoginRequiredPopup'), { ssr: false });
const LottieCalendar = dynamic(() => import('./lotties/LottieCalendar'), { ssr: false });
const LottieWorldMyWazaa = dynamic(() => import('./lotties/LottieWorldMyWazaa'), { ssr: false });
const AboutLottie = dynamic(() => import('./lotties/AboutLottie'), { ssr: false });

const SideMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  const [showLoginRequiredPopup, setShowLoginRequiredPopup] = useState(false);
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, [auth]);
/*
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Erreur de déconnexion', error);
    }
  }; */

  const openPopup = (setPopupState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setPopupState(true);
    navigate('#checking-popup'); // Ajoute une entrée dans l'historique
  };

  const closePopup = (setPopupState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setPopupState(false);
    if (location.hash === '#checking-popup') {
      router.back(); // Retourne à l'entrée précédente dans l'historique
    }
  };

  useEffect(() => {
    // Détecte les changements dans le hash pour fermer les popups
    if (!location.hash.includes('popup')) {
      setShowContactPopup(false);
      setShowLoginRequiredPopup(false);
    }
  }, []); // ajouter location ?

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleContactPopup = () => {
    showContactPopup ? closePopup(setShowContactPopup) : openPopup(setShowContactPopup);
    // toggleMenu();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLinkClick = (action?: () => void) => {
    closeMenu();
    if (action) action();
  };
/*
  const openComingSoonPopup = () => {
    setShowComingSoonPopup(true);
    toggleMenu();
  }; */

  const openLoginRequiredPopup = () => {
    showLoginRequiredPopup ? closePopup(setShowLoginRequiredPopup) : openPopup(setShowLoginRequiredPopup);
    // toggleMenu();
  };

  const aboutLottie = 'https://res.cloudinary.com/dvzsvgucq/raw/upload/v1716624105/About_Lottie_h9789c.json';
  const worldLottie = 'https://res.cloudinary.com/dvzsvgucq/raw/upload/v1716627571/Earth1-_1708701894997_nerun5.json';
  const loupe = 'https://res.cloudinary.com/dvzsvgucq/raw/upload/v1716628193/Loupe_-_1708980970911_ydnv6k.json';
  const calendarLottie = 'https://res.cloudinary.com/dvzsvgucq/raw/upload/v1716627386/Calendar_-_1712091697562_amlidv.json';

  return (
    <>
      {/*
      <div className={`side-menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="menu-text-container">
          <div className="menu-text">MENU</div>
        </div>
        <div className="menu-arrow">&#x27A4;</div>
      </div>
      */}

      <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        {/*
        <div className="side-menu-close" onClick={toggleMenu}>&times;</div>
        <div className="side-menu-header">
          <h2 className="side-menu-title">
            <Link to="/" className="side-menu-link-title">WAZAA</Link>
          </h2>
        </div>
        */}

        <div className="side-menu-content">
        {isLoggedIn ? (
            <>
              {/* <div className="side-menu-item add-event" onClick={() => handleLinkClick()}>
                <Link to="/evenement" className="side-menu-link__add-event">Créer un événement</Link>
              </div> */}
              <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link href="/" className="side-menu-link">
                <span className="side-menu-text">Retour à la carte</span> <LottieWorldMyWazaa animationUrl={worldLottie} />
                </Link>
              </div>
              <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link href="/mes-evenements" className="side-menu-link">
                  <span className="side-menu-text side-menu-my-events">Mes événements</span> <LottieCalendar animationUrl={calendarLottie} />
                </Link>
              </div>
              {/* <div className="side-menu-item" onClick={() => openComingSoonPopup()}>
                <Link to="" className="side-menu-link">Match ! <LottieSideMenu animationData={thunderLottie} /></Link>
              </div> */}
              <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link href="/favoris" className="side-menu-link">
                  <span className="side-menu-text">Mes Favoris</span> <i className='fa-heart fas favorited' style={{ marginLeft: '20px' }}></i>
                </Link>
              </div>
              <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link href="recherche-avancee" className="side-menu-link">
                  <span className="side-menu-text">Recherche avancée</span> <LottieWorldMyWazaa animationUrl={loupe} />
                </Link>
              </div>
              {/* <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link href="/faq" className="side-menu-link">FAQ</Link>
                  </div> */}

              {/* <div className="group-separator"></div> */}

              {/* <div className="side-menu-item">A propos de WAZAA</div> */}
              {/* <div className="side-menu-item">Devenir partenaire</div>
              <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link href="/mentions-legales" className="side-menu-link">Mentions légales</Link>
                </div> */}
              <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link href="/qui-sommes-nous" className="side-menu-link">
                  <span className="side-menu-text">A propos de WAZAA</span> <AboutLottie animationUrl={aboutLottie} />
                </Link>
              </div>
              <div className="side-menu-item" onClick={toggleContactPopup} >
                <div className="side-menu-link">
                  <span className="side-menu-text">Contact</span> <i className='fa-envelope fas' style={{ marginLeft: '20px' }}></i>
                </div>
              </div>
              {/* <div className="side-menu-disconnect" onClick={() => handleLinkClick(handleLogout)}>
                Déconnexion
              </div> */}
            </>
          ) : (
            <>
              {/* <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link to="/inscription-choice" className="side-menu-link">Inscription</Link>
              </div> */}
              <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link href="/connexion-choice" className="side-menu-link">
                  <span className="side-menu-text">Connexion</span> <i className='fa-sign-in-alt fas' style={{ marginLeft: '20px' }}></i>
                </Link>
              </div>
              <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link href="/" className="side-menu-link">
                  <span className="side-menu-text">Retour à la carte</span> <LottieWorldMyWazaa animationUrl={worldLottie} />
                </Link>
              </div>
              <div className="side-menu-item" >
                <Link href="recherche-avancee" className="side-menu-link">
                  <span className="side-menu-text">Recherche avancée</span> <LottieWorldMyWazaa animationUrl={loupe} />
                </Link>
              </div>
              <div className="side-menu-item" onClick={() => openLoginRequiredPopup()}>
                <div className="side-menu-link">
                  <span className="side-menu-text">Mes Favoris</span> <i className='fa-heart fas favorited' style={{ marginLeft: '20px' }}></i>
                </div>
              </div>
              {/* <div className="side-menu-item" onClick={() => handleLinkClick()}> ou onClick={() => openLoginRequiredPopup()}
                <Link href="/faq" className="side-menu-link">FAQ</Link>
                </div> */}

              {/* <div className="group-separator"></div> */}

              {/* <div className="side-menu-item">A propos de WAZAA</div> */}
              {/* <div className="side-menu-item">Devenir partenaire</div>
              <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link href="/mentions-legales" className="side-menu-link">Mentions légales</Link>
              </div> */}
              <div className="side-menu-item" onClick={() => handleLinkClick()}>
                <Link href="/qui-sommes-nous" className="side-menu-link">
                  <span className="side-menu-text">A propos de WAZAA</span> <AboutLottie animationUrl={aboutLottie} />
                </Link>
              </div>
              <div className="side-menu-item" onClick={toggleContactPopup} >
                <div className="side-menu-link">
                  <span className="side-menu-text">Contact</span> <i className='fa-envelope fas' style={{ marginLeft: '20px' }}></i>
                </div>
              </div>
            </>
          )}
        </div>

        {/*
        <div className="side-menu-footer">
          <p className='side-menu-icons-copyright'>&copy; 2024 WAZAA. Tous droits réservés.</p>
          <p className='side-menu-icons-title'>Suivez-nous sur les réseaux sociaux</p>
          <div className="social-icons">
            <a href="https://www.facebook.com/wazaa.official" target="_blank" rel="noreferrer">
              <img src="/icon-facebook.svg" alt="Facebook" />
            </a>
            <a href="https://www.linkedin.com/company/wazaa-app/" target="_blank" rel="noreferrer">
              <img src="/icon-twitter.svg" alt="Twitter" />
            </a>
            <a href="https://www.instagram.com/wazaa.app/" target="_blank" rel="noreferrer">
              <img src="/icon-instagram.svg" alt="Instagram" />
            </a>
          </div>
        </div>
        */}
      </div>

      {isMenuOpen && <div className="side-menu-backdrop" onClick={toggleMenu}></div>}
      {showContactPopup && <ContactPopup onClose={() => closePopup(setShowContactPopup)} />}
      {/* {showComingSoonPopup && <ComingSoonPopup onClose={() => setShowComingSoonPopup(false)} />} */}
      {showLoginRequiredPopup && <LoginRequiredPopup onClose={() => closePopup(setShowLoginRequiredPopup)} />}
    </>
  );
};

export default SideMenu;
