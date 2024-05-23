// src/app/qui-sommes-nous/page.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import ContactPopup from '../../components/ContactPopup';
import MobileMenu from '../../components/MobileMenu';
import ScrollToTopButton from '../../components/ScrollToTopButton';

const Apropos: React.FC = () => {
  const [showContactPopup, setShowContactPopup] = useState(false);
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };

  const openPopup = (setPopupState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setPopupState(true);
    navigate('#checking-popup'); // Ajoute une entrée dans l'historique
  };

  const closePopup = (setPopupState: React.Dispatch<React.SetStateAction<boolean>>) => {
    setPopupState(false);
    if (window.location.hash === '#checking-popup') {
      window.history.back();
    }
  };

  const toggleContactPopup = () => {
    showContactPopup ? closePopup(setShowContactPopup) : openPopup(setShowContactPopup);
  };

  // Gestionnaire d'événement popstate pour fermer la popup lors du retour arrière
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      if (!window.location.hash.includes('popup')) {
        setShowContactPopup(false);
      }
    });
  }

  return (
    <div className="about_container">
      <Head>
        <title>À propos de Wazaa</title>
        <meta name="description" content="Découvrez comment Wazaa transforme la découverte d'événements locaux grâce à une plateforme centralisée et des fonctionnalités innovantes." />
      </Head>
      <section className="about_hero-header">
        <div className="about_hero-content">
          <video className="about_hero-video" autoPlay loop muted>
            <source src="https://res.cloudinary.com/dvzsvgucq/video/upload/v1685005767/make64.REV1_g5zdjp.mp4" type="video/mp4" />
            Votre navigateur ne prend pas en charge les vidéos HTML5.
          </video>
          <div className="about_hero-overlay"></div>
          <div className="about_hero-text">
            <h1 className="about_hero-title">Live and spread the WOW*</h1>
            <p className="about_hero-title-translation">*Nous existons pour vivre et partager des moments d&apos;émerveillement</p>
          </div>
        </div>
      </section>

      <section className="about_manifesto-container">
        <div className="about_manifesto-content">
          <h2 className="about_manifesto-title">Manifeste</h2>
          <p className="about_manifesto-text">
            Imaginez un monde où chaque journée vous offre la possibilité de découvrir, à chaque coin de rue, des événements qui correspondent à vos passions et à vos centres d&apos;intérêt... En quelques clics !
          </p>
          <p className="about_manifesto-text">
            Ce monde existe, et il s&apos;appelle Wazaa.
          </p>

            <h3 className="about_manifesto-subtitle-text">&ldquo;What&apos;s up?&rdquo;</h3>
          <p className="about_manifesto-text">
            C&apos;est la question qui a donné naissance à Wazaa. Dans un univers où l&apos;information est omniprésente mais dispersée, notre plateforme crée un point de convergence unique autour de la question : &ldquo;Quoi de neuf autour de moi ?&rdquo;
          </p>
          <p className="about_manifesto-text">
            Nous avons pour ambition de redéfinir la manière dont chacun explore et interagit avec son environnement, qu&apos;il soit local ou mondial. Wazaa est la plateforme centrale qui rassemble les initiatives locales, des plus intimes aux plus grands rassemblements, offrant un accès universel à une myriade d&apos;événements.
          </p>
          <p className="about_manifesto-text">
            Dites adieu à la frustration des recherches multicanales. Nous souhaitons transformer chaque recherche en une expérience de découverte et de connexion avec le monde qui vous entoure.
          </p>

          <h3 className="about_manifesto-subtitle-text">Créez, partagez, découvrez, participez</h3>
          <p className="about_manifesto-text">
            Des festivals de musique aux expositions d&apos;art, en passant par les événements sportifs, les conférences, les marchés ou encore les spectacles, les événements professionels, caritatifs et bien d&apos;autres...
            Chaque jour, la découverte se trouve à portée de clic dans le monde de Wazaa.
          </p>
          <p className="about_manifesto-mission">
            Notre mission est de faire vivre des émotions positives, d&apos;aider les gens à s&apos;épanouir et d&apos;enrichir la vie sociale en facilitant l&apos;accès à des expériences qui rencontrent les passions et les centres d&apos;intérêt de chacun.
          </p>
          <p className="about_manifesto-note">
            Wazaa évolue constamment pour améliorer votre expérience et introduire de nouvelles fonctionnalités. Aujourd&apos;hui ancrés dans le Sud-Ouest de la France, demain à travers le pays, et bientôt autour du monde.
          </p>
        </div>
      </section>

      <section className="about_values-container">
        <video autoPlay muted loop className="wizard_video-background about-values_video-background">
          <source src="https://res.cloudinary.com/dvzsvgucq/video/upload/v1679239423/FREE_4K_Light_Leak_o8bz1x.mp4" type="video/mp4" />
          Votre navigateur ne prend pas en charge les vidéos HTML5.
        </video>
        <h2 className="about_values-title">Nos valeurs</h2>
        <div className="about_values-content">
          <h3>
            &ldquo;We live to deliver WOW*&rdquo;
          </h3>
          <p className="about_values-text">
            Notre mission est de vous offrir des expériences dont vous vous souviendrez.
          </p>
        </div>

        <div className="about_values-content">
          <h3>
            &ldquo;Entertain, inspire, share&rdquo;
          </h3>
          <p className="about_values-text">
            Nous voulons divertir, inspirer et partager.
            Notre mission est de connecter les gens à travers des expériences locales inoubliables.
          </p>
        </div>

        <div className="about_values-content">
          <h3>
            &ldquo;Empowering local communities and businesses&rdquo;
          </h3>
          <p className="about_values-text">
            Nous voulons donner du pouvoir aux communautés locales et aux entreprises.
            Nous souhaitons également être le partenaire privilégié des organisateurs d&apos;événements, en leur fournissant les outils nécessaires pour mieux connecter, vendre, et créer des communautés engagées autour de leurs événements.
          </p>
        </div>
      </section>

      <section className="about_call-to-actions">
        <Link href="/evenement" className="about_call-to-action-card">
          <div className="about_call-to-action-card-content">
            <span className="about_call-to-action-overlay"></span>
            <div className="about_call-to-action-background" style={{ backgroundImage: "url('https://res.cloudinary.com/dvzsvgucq/image/upload/v1696004383/hervemake_A_bustling_Airbnb_street_festival_where_every_booth_r_ac047cf3-5707-453a-8b73-a63c12a75ea9_d35qpn.png')" }}></div>
            <span className="about_call-to-action-text">
              Créer un événement
            </span>
          </div>
        </Link>
        <Link href="/" className="about_call-to-action-card">
          <div className="about_call-to-action-card-content">
            <span className="about_call-to-action-overlay"></span>
            <div className="about_call-to-action-background" style={{ backgroundImage: "url('https://res.cloudinary.com/dvzsvgucq/image/upload/v1713381736/uploads/affiches/event_poster_1713381734979.png')" }}></div>
            <span className="about_call-to-action-text">
              Explorer le monde de Wazaa
            </span>
          </div>
        </Link>
        <div className="about_call-to-action-card" onClick={toggleContactPopup}>
          <div className="about_call-to-action-card-content">
            <span className="about_call-to-action-overlay"></span>
            <div className="about_call-to-action-background" style={{ backgroundImage: "url('https://res.cloudinary.com/dvzsvgucq/image/upload/v1688319003/0_3_z69gcb.png')" }}></div>
            <div className="about_call-to-action-text">
              Nous contacter
            </div>
          </div>
        </div>
      </section>
      {showContactPopup && <ContactPopup onClose={() => closePopup(setShowContactPopup)} />}

      <MobileMenu />
      <ScrollToTopButton />
    </div>
  );
};

export default Apropos;
