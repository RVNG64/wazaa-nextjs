// src/app/mentions-legales/page.tsx
/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import dynamic from 'next/dynamic';

const MobileMenu = dynamic(() => import('../../components/MobileMenu'), { ssr: false });
const ScrollToTopButton = dynamic(() => import('../../components/ScrollToTopButton'), { ssr: false });

export default function LegalMentions() {

  return (
    <>
      <div className="legal-mentions">
        <h1>Mentions Légales</h1>

        <p>Ce site est édité par WAZAA, domicilié à Bayonne.</p>
        <p>Directeur de la publication : WAZAA</p>
        <p>Contact : <a href="mailto:hello@wazaa.app">hello@wazaa.app</a></p>

        <h2>Hébergement</h2>
        <p>Ce site est hébergé par OVH, dont le siège social est situé en France.</p>

        <h2>Propriété intellectuelle</h2>
        <p>Tous les contenus présents sur le site de WAZAA, incluant, sans s'y limiter, les graphismes, images, textes, vidéos, animations, sons, logos, gifs et icônes ainsi que leur mise en forme sont la propriété exclusive de la société à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.</p>
        <p>Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans l'accord exprès par écrit de WAZAA. Cette représentation ou reproduction, par quelque procédé que ce soit, constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle. Le non-respect de cette interdiction constitue une contrefaçon pouvant engager la responsabilité civile et pénale du contrefacteur.</p>

        <h2>Limitations de responsabilité</h2>
        <p>WAZAA ne pourra être tenue responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site WAZAA. WAZAA décline également toute responsabilité quant aux éventuels dommages indirects (tels que la perte de marché ou perte d'une chance) consécutifs à l'utilisation du site WAZAA.</p>

        <h2>Données personnelles</h2>
        <p>Conformément aux dispositions de la loi 78-17 du 6 janvier 1978 modifiée, l'utilisateur du site WAZAA dispose d'un droit d'accès, de modification et de suppression des informations collectées. Pour exercer ce droit, envoyez un message à notre Délégué à la Protection des Données : hello@wazaa.app.</p>
        <p>Pour plus de détails, veuillez consulter notre politique de confidentialité accessible sur notre site.</p>

        <h2>Politique de cookies</h2>
        <p>Le site WAZAA utilise des cookies pour améliorer l'expérience utilisateur et optimiser les performances du site. Les utilisateurs peuvent gérer ou désactiver l'utilisation de cookies via les paramètres de leur navigateur.</p>

        <h2>Modification des mentions légales</h2>
        <p>WAZAA se réserve le droit de modifier les présentes mentions légales à tout moment. L'utilisateur est invité à les consulter régulièrement.</p>

        <h2>Droit applicable et attribution de juridiction</h2>
        <p>Tout litige en relation avec l'utilisation du site WAZAA est soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>

        <p>Création du site : WAZAA</p>
        <p>Date de la dernière mise à jour : 14/03/2024</p>
      </div>
      <MobileMenu />
      <ScrollToTopButton />
    </>
  );
}
